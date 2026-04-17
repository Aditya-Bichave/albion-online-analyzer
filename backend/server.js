const WebSocket = require('ws');
const path = require('path');
const Simulator = require('./simulator');
const PacketSniffer = require('./sniffer');
const { createLogger } = require('../logging/logger');
const { normalizeLevel, shouldLog } = require('../logging/log-levels');
const { resolveLoggingConfig } = require('../logging/runtime');

const PORT = 8080;
const rootDir = path.join(__dirname, '..');
const loggingConfig = resolveLoggingConfig(rootDir);
let wss = null;
const initialMode = process.env.RADAR_MODE && process.env.RADAR_MODE.toLowerCase() === 'sniffer'
    ? 'sniffer'
    : 'simulation';
let currentMode = initialMode;
let currentEngine = null;
let nextClientId = 1;

function summarizeValue(value, depth = 0) {
    if (value === null || value === undefined) {
        return value ?? null;
    }

    if (depth > 3) {
        if (Array.isArray(value)) {
            return `[array:${value.length}]`;
        }

        if (Buffer.isBuffer(value)) {
            return `[buffer:${value.length}]`;
        }

        if (typeof value === 'object') {
            return `[object:${Object.keys(value).length}]`;
        }
    }

    if (Buffer.isBuffer(value)) {
        return {
            type: 'buffer',
            length: value.length,
            hex: value.subarray(0, 24).toString('hex')
        };
    }

    if (Array.isArray(value)) {
        return value.slice(0, 8).map(item => summarizeValue(item, depth + 1));
    }

    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).slice(0, 12).map(([key, nested]) => [key, summarizeValue(nested, depth + 1)])
        );
    }

    return value;
}

function broadcastRaw(payload) {
    if (!wss) {
        return;
    }

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
}

function streamLogRecord(record) {
    if (!shouldLog(record.level, loggingConfig.uiStreamLevel)) {
        return;
    }

    broadcastRaw(JSON.stringify({
        event: 'APP_LOG',
        data: {
            timestamp: record.timestamp,
            sessionId: record.sessionId,
            source: record.process,
            level: record.level,
            event: record.message,
            context: record.context
        }
    }));
}

const logger = createLogger({
    processName: 'backend',
    rootDir,
    onRecord: streamLogRecord
});
const frontendLogSink = createLogger({
    processName: 'frontend',
    rootDir,
    mirrorToConsole: false
});

// Create instances of our engines
// We broadcast any event out to all connected websocket clients.
const broadcast = (data) => {
    const payload = JSON.stringify(data);
    if (data?.event !== 'APP_LOG') {
        logger.debug('ws_broadcast', {
            event: data?.event ?? 'unknown',
            mode: currentMode,
            payload: summarizeValue(data?.data)
        });
    }
    broadcastRaw(payload);
};

const createEngine = (mode) => {
    if (mode === 'sniffer') {
        logger.info('create_engine', { mode: 'sniffer' });
        return new PacketSniffer(broadcast, logger);
    }

    logger.info('create_engine', { mode: 'simulation' });
    return new Simulator(broadcast, logger);
};

const sendToClient = (client, data) => {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
        logger.debug('ws_send_to_client', {
            clientId: client.__clientId,
            event: data?.event ?? 'unknown',
            payload: summarizeValue(data?.data)
        });
    }
};

const sendStateSnapshot = (client) => {
    const snapshot = currentEngine?.getSnapshot?.();
    if (!snapshot) {
        logger.warning('state_snapshot_missing', {
            clientId: client.__clientId,
            mode: currentMode
        });
        return;
    }

    logger.info('state_snapshot_sent', {
        clientId: client.__clientId,
        mode: snapshot.mode,
        zoneInfo: summarizeValue(snapshot.zoneInfo),
        nodeCount: Array.isArray(snapshot.nodes) ? snapshot.nodes.length : 0,
        playerPos: summarizeValue(snapshot.playerPos)
    });

    sendToClient(client, {
        event: 'STATE_SNAPSHOT',
        data: snapshot
    });
};

const startMode = (mode) => {
    currentMode = mode;
    currentEngine = createEngine(mode);
    logger.info('start_mode', { mode });
    return currentEngine.start?.() ?? { ok: true };
};

const stopCurrentEngine = () => {
    if (currentEngine && typeof currentEngine.stop === 'function') {
        logger.info('stop_mode', { mode: currentMode });
        currentEngine.stop();
    }

    currentEngine = null;
};

const switchMode = (nextMode) => {
    if (!['simulation', 'sniffer'].includes(nextMode)) {
        logger.warning('unsupported_mode_requested', { nextMode });
        return { ok: false, message: `Unsupported mode: ${nextMode}` };
    }

    if (nextMode === currentMode && currentEngine) {
        logger.info('mode_switch_noop', { mode: currentMode });
        return { ok: true, mode: currentMode, message: `Already running in ${currentMode} mode.` };
    }

    logger.info('mode_switch_requested', {
        currentMode,
        nextMode
    });
    stopCurrentEngine();
    const result = startMode(nextMode);

    if (!result.ok) {
        logger.warning('mode_switch_failed_fallback', {
            nextMode,
            errorMessage: result.message || 'unknown'
        });
        stopCurrentEngine();
        const fallback = startMode('simulation');

        if (!fallback.ok) {
            return { ok: false, message: result.message || 'Failed to start selected mode.' };
        }

        broadcast({
            event: 'MODE_CHANGED',
            data: {
                mode: currentMode,
                message: `Failed to start live mode. Fell back to simulation mode. ${result.message || ''}`.trim()
            }
        });

        return {
            ok: false,
            mode: currentMode,
            message: result.message || 'Failed to start selected mode.'
        };
    }

    broadcast({
        event: 'MODE_CHANGED',
        data: {
            mode: currentMode,
            message: `Switched to ${currentMode === 'sniffer' ? 'live mode' : 'simulation mode'}.`
        }
    });

    return {
        ok: true,
        mode: currentMode,
        message: `Switched to ${currentMode} mode.`
    };
};

wss = new WebSocket.Server({ port: PORT });
wss.on('error', (error) => {
    logger.error('websocket_server_error', { error, port: PORT });
});

wss.on('connection', (ws) => {
    ws.__clientId = `client-${nextClientId++}`;
    logger.info('ws_client_connected', {
        clientId: ws.__clientId,
        totalClients: wss.clients.size
    });
    // Send a welcome message or sync current known nodes if we were caching them
    sendToClient(ws, {
        event: 'CONNECTED',
        data: {
            message: `Albion Radar Backend Connected (${currentMode === 'sniffer' ? 'Live Mode' : 'Simulation Mode'})`,
            mode: currentMode,
            sessionId: loggingConfig.sessionId,
            logLevel: loggingConfig.logLevel,
            logUiStreamLevel: loggingConfig.uiStreamLevel,
            packetVerbose: loggingConfig.packetVerbose
        }
    });
    sendStateSnapshot(ws);

    ws.on('message', (rawMessage) => {
        try {
            const message = JSON.parse(rawMessage.toString());
            logger.debug('ws_client_message', {
                clientId: ws.__clientId,
                command: message.command,
                payload: summarizeValue(message.data)
            });

            if (message.command === 'SET_MODE') {
                const requestedMode = message.data?.mode;
                const result = switchMode(requestedMode);

                sendToClient(ws, {
                    event: result.ok ? 'MODE_SWITCH_ACK' : 'MODE_SWITCH_ERROR',
                    data: {
                        mode: currentMode,
                        message: result.message
                    }
                });
                sendStateSnapshot(ws);
            }
            if (message.command === 'CLIENT_LOG') {
                const level = normalizeLevel(message.data?.level || 'info');
                const methodName = level === 'warning' ? 'warning' : level;
                const clientContext = {
                    clientId: ws.__clientId,
                    frontendTimestamp: message.data?.timestamp ?? null,
                    ...(message.data?.context || {})
                };
                frontendLogSink[methodName]?.(message.data?.message || 'frontend_log', clientContext);
            }
        } catch (error) {
            logger.error('ws_message_processing_failed', {
                clientId: ws.__clientId,
                error,
                rawMessage: rawMessage.toString().slice(0, 500)
            });
            sendToClient(ws, {
                event: 'MODE_SWITCH_ERROR',
                data: {
                    mode: currentMode,
                    message: `Failed to process backend command: ${error.message}`
                }
            });
        }
    });

    ws.on('close', () => {
        logger.info('ws_client_closed', {
            clientId: ws.__clientId,
            totalClients: wss.clients.size
        });
    });

    ws.on('error', (error) => {
        logger.error('ws_client_error', {
            clientId: ws.__clientId,
            error
        });
    });
});

logger.info('websocket_server_started', {
    url: `ws://localhost:${PORT}`,
    sessionId: loggingConfig.sessionId,
    uiStreamLevel: loggingConfig.uiStreamLevel
});
logger.info('engine_bootstrap', { mode: currentMode });
startMode(currentMode);
