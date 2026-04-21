import React, { useCallback, useEffect, useRef, useState } from 'react';
import InteractiveMap from './components/InteractiveMap';
import ResourceSidebar from './components/ResourceSidebar';
import PlayerSidebar from './components/PlayerSidebar';
import ConsoleLogger from './components/ConsoleLogger';
import ProfitTreeCalculator from './components/calculator/ProfitTreeCalculator';
import { createRendererLogger } from './logger';
import { PRESETS } from './utils/presetConfig';
import {
    closeOverlay,
    getOverlayState,
    isElectronRuntime,
    openOverlay,
    updateOverlaySettings
} from './electronBridge';

const STORAGE_KEYS = {
    filters: 'alalyzer:filters',
    activeTab: 'alalyzer:activeTab',
    playerFilters: 'alalyzer:playerFilters',
    worldFilters: 'alalyzer:worldFilters',
    captureAdapterIp: 'alalyzer:captureAdapterIp',
    overlayPrefs: 'alalyzer:overlayPrefs'
};

const DEFAULT_RESOURCE_FILTERS = {
    tiers: [1, 2, 3, 4, 5, 6, 7, 8],
    types: ['wood', 'ore', 'fiber', 'hide', 'stone'],
    minEnchant: 0
};

const DEFAULT_PLAYER_FILTERS = {
    hostile: true,
    faction: true,
    passive: true
};

const DEFAULT_WORLD_FILTERS = {
    mob: true,
    mist: true,
    dungeon: true,
    chest: true,
    fishing: true,
    cage: true,
    wisp: true
};

const DEFAULT_OVERLAY_PREFS = {
    clickThrough: false,
    alwaysOnTop: true,
    opacity: 0.92
};

function readStoredJson(key, fallback) {
    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
        return fallback;
    }
}

function readStoredString(key, fallback = '') {
    try {
        return window.localStorage.getItem(key) ?? fallback;
    } catch {
        return fallback;
    }
}

function writeStoredValue(key, value) {
    try {
        if (value === null || value === undefined || value === '') {
            window.localStorage.removeItem(key);
            return;
        }

        const serialized = typeof value === 'string' ? value : JSON.stringify(value);
        window.localStorage.setItem(key, serialized);
    } catch {
        // Ignore storage failures in the renderer.
    }
}

function App() {
    const isCompactView = typeof window !== 'undefined'
        && new URLSearchParams(window.location.search).get('view') === 'minimap';
    const [nodes, setNodes] = useState([]);
    const [players, setPlayers] = useState([]);
    const [worldEntities, setWorldEntities] = useState([]);
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const [playerTrail, setPlayerTrail] = useState([{ x: 0, y: 0 }]);
    const [zoneInfo, setZoneInfo] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Connecting to backend...');
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);
    const [backendMode, setBackendMode] = useState('simulation');
    const [isSwitchingMode, setIsSwitchingMode] = useState(false);
    const [filters, setFilters] = useState(() => readStoredJson(STORAGE_KEYS.filters, DEFAULT_RESOURCE_FILTERS));
    const [activePresetId, setActivePresetId] = useState('default');
    const [showRoute, setShowRoute] = useState(true);
    const [showHotspots, setShowHotspots] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [playerFilters, setPlayerFilters] = useState(() => readStoredJson(STORAGE_KEYS.playerFilters, DEFAULT_PLAYER_FILTERS));
    const [worldFilters, setWorldFilters] = useState(() => readStoredJson(STORAGE_KEYS.worldFilters, DEFAULT_WORLD_FILTERS));
    const [activeTab, setActiveTab] = useState(() => readStoredString(STORAGE_KEYS.activeTab, 'map'));
    const [captureAdapters, setCaptureAdapters] = useState([]);
    const [selectedCaptureAdapterIp, setSelectedCaptureAdapterIp] = useState(() => readStoredString(STORAGE_KEYS.captureAdapterIp, ''));
    const [activeCaptureAdapter, setActiveCaptureAdapter] = useState(null);
    const [hostileAlert, setHostileAlert] = useState(null);
    const [overlayPrefs, setOverlayPrefs] = useState(() => readStoredJson(STORAGE_KEYS.overlayPrefs, DEFAULT_OVERLAY_PREFS));
    const [overlayOpen, setOverlayOpen] = useState(false);
    const activePreset = PRESETS.find((preset) => preset.id === activePresetId) || PRESETS[0];

    useEffect(() => {
        if (activePresetId !== 'custom') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFilters(activePreset.filters);
        }
    }, [activePresetId, activePreset]);

    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const shouldReconnect = useRef(true);
    const hostileAlertTimer = useRef(null);
    const lastLogSignature = useRef('');
    const rendererLogger = useRef(null);
    const rendererLogLevel = useRef(import.meta.env.VITE_LOG_LEVEL || 'info');
    const uiLogLevel = useRef(import.meta.env.VITE_LOG_UI_STREAM_LEVEL || 'info');
    const zoneInfoRef = useRef(null);
    const selectedCaptureAdapterIpRef = useRef(selectedCaptureAdapterIp);

    const appendConsoleLog = useCallback(({ timestamp, source = 'app', level = 'info', event = 'log', text = '', context = null }) => {
        const logTime = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        const extraText = context ? ` // ${JSON.stringify(context)}` : '';
        setLogs(prev => [...prev, {
            time: logTime,
            source,
            level,
            event,
            text: `${text}${extraText}`.trim()
        }].slice(-300));
    }, []);

    const formatLogText = useCallback((eventName, data) => {
        if (eventName === 'ALBION_DECODED') {
            return `${data?.name ?? 'Unknown'} (#${data?.code ?? '?'}) // keys=${Array.isArray(data?.keys) ? data.keys.join(',') : 'n/a'} // ${JSON.stringify(data?.parameters ?? {})}`;
        }

        if (eventName === 'SNIFFER_STATS') {
            return `packetsSeen=${data?.packetsSeen ?? 0}, nodes=${data?.trackedNodes ?? 0}, players=${data?.trackedPlayers ?? 0}, player=${data?.trackedPlayerName ?? 'unknown'}#${data?.trackedPlayerEntityId ?? 'n/a'}, decoder=${data?.decoder ?? 'unknown'}`;
        }

        if (eventName === 'SNIFFER_STATUS') {
            return `${data?.state ?? 'unknown'} // ${data?.message ?? 'No status message'}`;
        }

        if (eventName === 'PLAYER_SPOTTED') {
            return `${data?.name ?? 'Unknown'} // ${data?.threat ?? 'unknown'} // ${data?.guildName || 'No guild'}`;
        }

        if (eventName === 'HOSTILE_ALERT') {
            return `Hostile detected: ${data?.name ?? 'Unknown player'} // ${data?.guildName || 'No guild'}`;
        }

        if (eventName === 'MAP_RESET') {
            return data?.reason ? `Map reset // ${data.reason}` : 'Map reset';
        }

        const serialized = JSON.stringify(data);
        return serialized.length > 220 ? `${serialized.substring(0, 220)}...` : serialized;
    }, []);

    const resetMapState = useCallback(() => {
        setNodes([]);
        setPlayers([]);
        setWorldEntities([]);
        setPlayerPos({ x: 0, y: 0 });
        setPlayerTrail([{ x: 0, y: 0 }]);
        setZoneInfo(null);
        setHostileAlert(null);
        rendererLogger.current?.debug('map_state_reset', {
            reason: 'resetMapState_called'
        });
    }, []);

    const applyCaptureMetadata = useCallback((capture) => {
        if (!capture || typeof capture !== 'object') {
            return;
        }

        if (Array.isArray(capture.adapters)) {
            setCaptureAdapters(capture.adapters);
        }

        setActiveCaptureAdapter(capture.selectedAdapter ?? null);
        setSelectedCaptureAdapterIp(capture.preferredAdapterIp || '');
    }, []);

    const showHostileAlert = useCallback((data) => {
        setHostileAlert(data);
        if (hostileAlertTimer.current) {
            clearTimeout(hostileAlertTimer.current);
        }

        hostileAlertTimer.current = setTimeout(() => {
            setHostileAlert(null);
            hostileAlertTimer.current = null;
        }, 5000);
    }, []);

    const requestModeChange = (nextMode) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN || nextMode === backendMode || isSwitchingMode) {
            return;
        }

        setIsSwitchingMode(true);
        setStatusMessage(`Switching to ${nextMode === 'sniffer' ? 'Live Mode' : 'Simulation Mode'}...`);
        rendererLogger.current?.info('mode_change_requested', {
            nextMode,
            currentMode: backendMode
        });
        resetMapState();
        ws.current.send(JSON.stringify({
            command: 'SET_MODE',
            data: { mode: nextMode }
        }));
    };

    const requestCaptureAdapterChange = (adapterIp) => {
        const nextValue = adapterIp || '';
        setSelectedCaptureAdapterIp(nextValue);
        setStatusMessage(nextValue
            ? `Applying capture adapter ${nextValue}...`
            : 'Clearing capture adapter preference...');

        rendererLogger.current?.info('capture_adapter_change_requested', {
            adapterIp: nextValue || null
        });

        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({
                command: 'SET_CAPTURE_ADAPTER',
                data: { adapterIp: nextValue || null }
            }));
        }
    };

    const handleOpenOverlay = useCallback(async () => {
        if (!isElectronRuntime()) {
            return;
        }

        const nextState = await openOverlay(overlayPrefs);
        setOverlayOpen(Boolean(nextState?.open));
    }, [overlayPrefs]);

    const handleCloseOverlay = useCallback(async () => {
        if (!isElectronRuntime()) {
            return;
        }

        const nextState = await closeOverlay();
        setOverlayOpen(Boolean(nextState?.open));
    }, []);

    const handleOverlayPrefChange = useCallback(async (partialUpdate) => {
        const nextPrefs = {
            ...overlayPrefs,
            ...partialUpdate
        };
        setOverlayPrefs(nextPrefs);

        if (!isElectronRuntime()) {
            return;
        }

        const nextState = await updateOverlaySettings(nextPrefs);
        setOverlayOpen(Boolean(nextState?.open));
    }, [overlayPrefs]);

    useEffect(() => {
        rendererLogger.current = createRendererLogger({
            getSocket: () => ws.current,
            getMinimumLevel: () => rendererLogLevel.current,
            onLocalRecord: (record) => {
                appendConsoleLog({
                    timestamp: record.timestamp,
                    source: 'frontend',
                    level: record.level,
                    event: record.message,
                    text: JSON.stringify(record.context ?? {})
                });
            }
        });

        rendererLogger.current.info('renderer_logger_initialized', {
            logLevel: rendererLogLevel.current,
            uiLogLevel: uiLogLevel.current
        });

        return () => {
            rendererLogger.current = null;
        };
    }, [appendConsoleLog]);

    useEffect(() => {
        if (!isElectronRuntime()) {
            return undefined;
        }

        let cancelled = false;

        getOverlayState()
            .then((nextState) => {
                if (cancelled || !nextState) {
                    return;
                }

                setOverlayOpen(Boolean(nextState.open));
                setOverlayPrefs(prev => ({
                    ...prev,
                    clickThrough: Boolean(nextState.clickThrough),
                    alwaysOnTop: nextState.alwaysOnTop !== false,
                    opacity: Number.isFinite(nextState.opacity) ? nextState.opacity : prev.opacity
                }));
            })
            .catch(() => {
                // Ignore overlay bootstrap failures outside Electron IPC.
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        shouldReconnect.current = true;

        const connectWebSocket = () => {
            if (!shouldReconnect.current) {
                return;
            }

            const socket = new WebSocket('ws://127.0.0.1:8080');
            ws.current = socket;

            socket.onopen = () => {
                if (reconnectTimer.current) {
                    clearTimeout(reconnectTimer.current);
                    reconnectTimer.current = null;
                }

                setIsConnected(true);
                setStatusMessage('Connected to Radar System');
                rendererLogger.current?.info('websocket_open', {
                    url: 'ws://127.0.0.1:8080'
                });
                rendererLogger.current?.flush();
            };

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.event === 'APP_LOG') {
                        appendConsoleLog({
                            timestamp: msg.data?.timestamp,
                            source: msg.data?.source || 'backend',
                            level: msg.data?.level || 'info',
                            event: msg.data?.event || 'APP_LOG',
                            text: JSON.stringify(msg.data?.context ?? {})
                        });
                        return;
                    }

                    rendererLogger.current?.debug('backend_event_received', {
                        event: msg.event,
                        payloadSummary: Array.isArray(msg.data)
                            ? `[array:${msg.data.length}]`
                            : Object.keys(msg.data || {})
                    });
                    const logText = formatLogText(msg.event, msg.data);
                    const signature = `${msg.event}::${logText}`;

                    if (lastLogSignature.current !== signature) {
                        lastLogSignature.current = signature;
                        setLogs(prev => [...prev, {
                            time: new Date().toLocaleTimeString(),
                            source: 'backend-event',
                            level: 'info',
                            event: msg.event,
                            text: logText
                        }].slice(-300));
                    }

                    switch (msg.event) {
                        case 'CONNECTED':
                            setIsConnected(true);
                            setStatusMessage(msg.data.message);
                            setBackendMode(msg.data.mode || 'simulation');
                            uiLogLevel.current = msg.data.logUiStreamLevel || uiLogLevel.current;
                            applyCaptureMetadata(msg.data.capture);
                            rendererLogger.current?.info('backend_connected', {
                                mode: msg.data.mode,
                                sessionId: msg.data.sessionId,
                                logUiStreamLevel: uiLogLevel.current,
                                packetVerbose: msg.data.packetVerbose
                            });
                            if (
                                selectedCaptureAdapterIpRef.current
                                && selectedCaptureAdapterIpRef.current !== (msg.data.capture?.preferredAdapterIp || '')
                            ) {
                                socket.send(JSON.stringify({
                                    command: 'SET_CAPTURE_ADAPTER',
                                    data: { adapterIp: selectedCaptureAdapterIpRef.current }
                                }));
                            }
                            setIsSwitchingMode(false);
                            break;
                        case 'STATE_SNAPSHOT':
                            if (msg.data?.mode) {
                                setBackendMode(msg.data.mode);
                            }
                            setZoneInfo(msg.data?.zoneInfo ?? null);
                            setNodes(Array.isArray(msg.data?.nodes) ? msg.data.nodes : []);
                            setPlayers(Array.isArray(msg.data?.players) ? msg.data.players : []);
                            setWorldEntities(Array.isArray(msg.data?.worldEntities) ? msg.data.worldEntities : []);
                            applyCaptureMetadata(msg.data?.capture);
                            if (msg.data?.playerPos && Number.isFinite(msg.data.playerPos.x) && Number.isFinite(msg.data.playerPos.y)) {
                                setPlayerPos(msg.data.playerPos);
                                setPlayerTrail([{ x: msg.data.playerPos.x, y: msg.data.playerPos.y }]);
                            } else {
                                setPlayerPos({ x: 0, y: 0 });
                                setPlayerTrail([{ x: 0, y: 0 }]);
                            }
                            rendererLogger.current?.info('state_snapshot_applied', {
                                mode: msg.data?.mode,
                                zoneInfo: msg.data?.zoneInfo ?? null,
                                nodeCount: Array.isArray(msg.data?.nodes) ? msg.data.nodes.length : 0,
                                playerCount: Array.isArray(msg.data?.players) ? msg.data.players.length : 0,
                                playerPos: msg.data?.playerPos ?? null
                            });
                            break;
                        case 'ZONE_ENTER':
                            {
                                const previousZone = zoneInfoRef.current;
                                const nextZone = msg.data ?? null;
                                const zoneChanged = !previousZone
                                    || previousZone.zoneId !== nextZone?.zoneId
                                    || previousZone.name !== nextZone?.name;
                                setZoneInfo(nextZone);

                                if (zoneChanged) {
                                    rendererLogger.current?.warning('zone_enter_reset_applied', {
                                        previousZone,
                                        nextZone
                                    });
                                    setNodes([]);
                                    setPlayers([]);
                                    setWorldEntities([]);
                                    setPlayerPos({ x: 0, y: 0 });
                                    setPlayerTrail([{ x: 0, y: 0 }]);
                                } else {
                                    rendererLogger.current?.debug('zone_enter_duplicate_ignored', {
                                        zoneInfo: nextZone
                                    });
                                }
                            }
                            break;
                        case 'NEW_NODE':
                            setNodes(prev => {
                                const existingIndex = prev.findIndex(node => node.id === msg.data.id);
                                if (existingIndex === -1) {
                                    return [...prev, msg.data];
                                }

                                const next = [...prev];
                                next[existingIndex] = msg.data;
                                return next;
                            });
                            break;
                        case 'REMOVE_NODE':
                            setNodes(prev => prev.filter(node => node.id !== msg.data.id));
                            break;
                        case 'PLAYER_SPOTTED':
                            setPlayers(prev => {
                                const existingIndex = prev.findIndex(player => player.id === msg.data.id);
                                if (existingIndex === -1) {
                                    return [...prev, msg.data];
                                }

                                const next = [...prev];
                                next[existingIndex] = msg.data;
                                return next;
                            });
                            break;
                        case 'PLAYER_LEFT':
                            setPlayers(prev => prev.filter(player => player.id !== msg.data.id));
                            break;
                        case 'PLAYER_LIST_RESET':
                            setPlayers([]);
                            break;
                        case 'WORLD_ENTITIES_PATCH':
                            setWorldEntities(prev => {
                                const next = new Map(prev.map(entity => [entity.uid, entity]));
                                for (const uid of msg.data?.removals || []) {
                                    next.delete(uid);
                                }
                                for (const entity of msg.data?.upserts || []) {
                                    next.set(entity.uid, entity);
                                }
                                return Array.from(next.values());
                            });
                            break;
                        case 'HOSTILE_ALERT':
                            showHostileAlert(msg.data);
                            setStatusMessage(`Hostile detected: ${msg.data?.name ?? 'Unknown player'}`);
                            break;
                        case 'PLAYER_MOVE':
                            setPlayerPos({ x: msg.data.x, y: msg.data.y });
                            setPlayerTrail(prev => {
                                const lastPoint = prev[prev.length - 1];
                                if (lastPoint && lastPoint.x === msg.data.x && lastPoint.y === msg.data.y) {
                                    return prev;
                                }

                                return [...prev, { x: msg.data.x, y: msg.data.y }].slice(-18);
                            });
                            break;
                        case 'MODE_CHANGED':
                            setBackendMode(msg.data.mode || 'simulation');
                            setStatusMessage(msg.data.message || 'Mode changed');
                            applyCaptureMetadata(msg.data.capture);
                            rendererLogger.current?.info('mode_changed', {
                                mode: msg.data.mode,
                                message: msg.data.message
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'MODE_SWITCH_ACK':
                            setBackendMode(msg.data.mode || 'simulation');
                            setStatusMessage(msg.data.message || 'Mode switched');
                            applyCaptureMetadata(msg.data.capture);
                            rendererLogger.current?.info('mode_switch_ack', {
                                mode: msg.data.mode,
                                message: msg.data.message
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'MODE_SWITCH_ERROR':
                            setBackendMode(msg.data.mode || 'simulation');
                            setStatusMessage(msg.data.message || 'Failed to switch mode');
                            applyCaptureMetadata(msg.data.capture);
                            rendererLogger.current?.error('mode_switch_error', {
                                mode: msg.data.mode,
                                message: msg.data.message
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'CAPTURE_ADAPTER_ACK':
                            applyCaptureMetadata(msg.data?.capture);
                            setStatusMessage(msg.data?.message || 'Capture adapter updated');
                            break;
                        case 'CAPTURE_ADAPTER_ERROR':
                            applyCaptureMetadata(msg.data?.capture);
                            setStatusMessage(msg.data?.message || 'Failed to update capture adapter');
                            break;
                        case 'MAP_RESET':
                            resetMapState();
                            setStatusMessage(msg.data?.reason ? `Map reset: ${msg.data.reason}` : 'Map reset');
                            rendererLogger.current?.warning('map_reset_received', {
                                reason: msg.data?.reason ?? null
                            });
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    rendererLogger.current?.error('websocket_message_parse_failed', {
                        error: error.message,
                        raw: event.data
                    });
                }
            };

            socket.onerror = (error) => {
                rendererLogger.current?.error('websocket_error', {
                    message: error?.message ?? 'WebSocket error'
                });
            };

            socket.onclose = () => {
                ws.current = null;
                setIsConnected(false);
                setIsSwitchingMode(false);
                setStatusMessage('Disconnected from backend - reconnecting...');
                rendererLogger.current?.warning('websocket_closed', {
                    willReconnect: shouldReconnect.current
                });

                if (shouldReconnect.current) {
                    reconnectTimer.current = setTimeout(connectWebSocket, 1500);
                }
            };
        };

        connectWebSocket();

        return () => {
            shouldReconnect.current = false;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            if (hostileAlertTimer.current) {
                clearTimeout(hostileAlertTimer.current);
            }
            rendererLogger.current?.info('app_cleanup', { reason: 'component_unmount' });
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [appendConsoleLog, applyCaptureMetadata, formatLogText, resetMapState, showHostileAlert]);

    useEffect(() => {
        zoneInfoRef.current = zoneInfo;
        rendererLogger.current?.debug('zone_state_changed', {
            zoneInfo
        });
    }, [zoneInfo]);

    useEffect(() => {
        selectedCaptureAdapterIpRef.current = selectedCaptureAdapterIp;
    }, [selectedCaptureAdapterIp]);

    useEffect(() => {
        writeStoredValue(STORAGE_KEYS.filters, filters);
    }, [filters]);

    useEffect(() => {
        writeStoredValue(STORAGE_KEYS.playerFilters, playerFilters);
    }, [playerFilters]);

    useEffect(() => {
        writeStoredValue(STORAGE_KEYS.worldFilters, worldFilters);
    }, [worldFilters]);

    useEffect(() => {
        writeStoredValue(STORAGE_KEYS.activeTab, activeTab);
    }, [activeTab]);

    useEffect(() => {
        writeStoredValue(STORAGE_KEYS.captureAdapterIp, selectedCaptureAdapterIp);
    }, [selectedCaptureAdapterIp]);

    useEffect(() => {
        writeStoredValue(STORAGE_KEYS.overlayPrefs, overlayPrefs);
    }, [overlayPrefs]);

    const filteredNodes = nodes.filter(node =>
        filters.tiers.includes(node.tier)
        && filters.types.includes(node.type)
        && node.enchant >= filters.minEnchant
    );

    const filteredPlayers = players.filter(player => playerFilters[player.threat] !== false);
    const filteredWorldEntities = worldEntities.filter(entity => worldFilters[entity.kind] !== false);
    const adapterSummary = activeCaptureAdapter
        ? `${activeCaptureAdapter.name} (${activeCaptureAdapter.ip})`
        : (selectedCaptureAdapterIp ? `Preferred adapter ${selectedCaptureAdapterIp}` : 'Auto-select adapter');

    if (isCompactView) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                background: 'rgba(5, 8, 12, 0.96)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'rgba(8, 12, 18, 0.96)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    WebkitAppRegion: 'drag'
                }}>
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--accent-cyan)' }}>
                            MINIMAP
                        </div>
                        <div style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-secondary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '230px'
                        }}>
                            {zoneInfo?.name || 'Waiting for zone'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', WebkitAppRegion: 'no-drag' }}>
                        <button
                            onClick={() => handleOverlayPrefChange({ clickThrough: !overlayPrefs.clickThrough })}
                            style={{
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: overlayPrefs.clickThrough ? 'rgba(34, 211, 238, 0.18)' : 'rgba(255,255,255,0.06)',
                                color: overlayPrefs.clickThrough ? '#fff' : 'var(--text-secondary)',
                                borderRadius: '999px',
                                padding: '6px 10px',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                            }}
                        >
                            {overlayPrefs.clickThrough ? 'Clicks Off' : 'Clicks On'}
                        </button>
                        <button
                            onClick={handleCloseOverlay}
                            style={{
                                border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.06)',
                                color: '#fff',
                                borderRadius: '999px',
                                padding: '6px 10px',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <InteractiveMap
                        nodes={filteredNodes}
                        players={filteredPlayers}
                        worldEntities={filteredWorldEntities}
                        playerPos={playerPos}
                        playerTrail={playerTrail}
                        zoneInfo={zoneInfo}
                        hostileAlert={hostileAlert}
                        compact
                    />
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{
                height: '56px',
                minHeight: '56px',
                background: 'rgba(0,0,0,0.8)',
                borderBottom: '1px solid var(--border-active)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 18px',
                gap: '14px',
                zIndex: 50
            }}>
                <div style={{ fontWeight: '900', marginRight: 'auto', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>
                    ALBION RADAR
                </div>
                <div style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: backendMode === 'sniffer' ? '#081014' : '#25130a',
                    background: backendMode === 'sniffer' ? 'rgba(34, 211, 238, 0.9)' : 'rgba(251, 191, 36, 0.9)'
                }}>
                    {backendMode === 'sniffer' ? 'Live Mode' : 'Simulation Mode'}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    {[
                        { key: 'simulation', label: 'Simulation' },
                        { key: 'sniffer', label: 'Live' }
                    ].map(option => {
                        const active = backendMode === option.key;
                        return (
                            <button
                                key={option.key}
                                onClick={() => requestModeChange(option.key)}
                                disabled={isSwitchingMode || active}
                                style={{
                                    background: active ? 'rgba(34, 211, 238, 0.18)' : 'transparent',
                                    border: 'none',
                                    color: active ? '#fff' : 'var(--text-secondary)',
                                    opacity: isSwitchingMode && !active ? 0.6 : 1,
                                    padding: '6px 14px',
                                    borderRadius: '999px',
                                    cursor: isSwitchingMode || active ? 'default' : 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.78rem'
                                }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
                <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '0.76rem'
                }}>
                    <span>Adapter</span>
                    <select
                        value={selectedCaptureAdapterIp}
                        onChange={(event) => requestCaptureAdapterChange(event.target.value)}
                        style={{
                            minWidth: '250px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#fff',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '10px',
                            padding: '8px 10px'
                        }}
                    >
                        <option value="">Auto-select best adapter</option>
                        {captureAdapters.map(adapter => (
                            <option key={adapter.id} value={adapter.ip}>
                                {adapter.name} ({adapter.ip})
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    onClick={overlayOpen ? handleCloseOverlay : handleOpenOverlay}
                    style={{
                        background: overlayOpen ? 'rgba(34, 211, 238, 0.16)' : 'transparent',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: overlayOpen ? '#fff' : 'var(--text-secondary)',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    {overlayOpen ? 'Close Minimap' : 'Open Minimap'}
                </button>
                {isElectronRuntime() && overlayOpen && (
                    <>
                        <button
                            onClick={() => handleOverlayPrefChange({ clickThrough: !overlayPrefs.clickThrough })}
                            style={{
                                background: overlayPrefs.clickThrough ? 'rgba(251, 191, 36, 0.18)' : 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: overlayPrefs.clickThrough ? '#fff' : 'var(--text-secondary)',
                                padding: '6px 12px',
                                borderRadius: '999px',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            {overlayPrefs.clickThrough ? 'Enable Clicks' : 'Click-through'}
                        </button>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.76rem'
                        }}>
                            <span>Opacity</span>
                            <input
                                type="range"
                                min="0.35"
                                max="1"
                                step="0.05"
                                value={overlayPrefs.opacity}
                                onChange={(event) => handleOverlayPrefChange({ opacity: Number(event.target.value) })}
                            />
                        </label>
                    </>
                )}
                <button
                    onClick={() => setActiveTab('map')}
                    style={{
                        background: activeTab === 'map' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: activeTab === 'map' ? '#fff' : 'var(--text-secondary)',
                        padding: '6px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Live Map
                </button>
                <button
                    onClick={() => setActiveTab('console')}
                    style={{
                        background: activeTab === 'console' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: activeTab === 'console' ? '#fff' : 'var(--text-secondary)',
                        padding: '6px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Network Console
                </button>
                <button
                    onClick={() => setActiveTab('calculator')}
                    style={{
                        background: activeTab === 'calculator' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: activeTab === 'calculator' ? '#fff' : 'var(--text-secondary)',
                        padding: '6px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Profit Calculator
                </button>
            </div>

            <div style={{ display: 'flex', flex: 1, zIndex: 1, overflow: 'hidden' }}>
                {activeTab === 'map' ? (
                    <>
                        <div style={{ zIndex: 10 }}>
                            <ResourceSidebar
                                nodes={nodes}
                                filters={filters}
                                setFilters={setFilters}
                                activePresetId={activePresetId}
                                setActivePresetId={setActivePresetId}
                                showRoute={showRoute}
                                setShowRoute={setShowRoute}
                                showHotspots={showHotspots}
                                setShowHotspots={setShowHotspots}
                                showHeatmap={showHeatmap}
                                setShowHeatmap={setShowHeatmap}
                                activePreset={activePreset}
                            />
                        </div>
                        <InteractiveMap
                            nodes={filteredNodes}
                            players={filteredPlayers}
                            worldEntities={filteredWorldEntities}
                            playerPos={playerPos}
                            playerTrail={playerTrail}
                            zoneInfo={zoneInfo}
                            activePreset={activePreset}
                            showRoute={showRoute}
                            showHotspots={showHotspots}
                            showHeatmap={showHeatmap}
                            hostileAlert={hostileAlert}
                        />
                        <div style={{ zIndex: 10 }}>
                            <PlayerSidebar
                                players={players}
                                playerFilters={playerFilters}
                                setPlayerFilters={setPlayerFilters}
                                hostileAlert={hostileAlert}
                                worldEntities={worldEntities}
                                worldFilters={worldFilters}
                                setWorldFilters={setWorldFilters}
                            />
                        </div>
                    </>
                ) : activeTab === 'console' ? (
                    <div style={{ flex: 1, display: 'flex', background: '#090a0d', padding: '24px', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '1200px' }}>
                            <ConsoleLogger logs={logs} />
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', background: '#090a0d', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%' }}>
                            <ProfitTreeCalculator />
                        </div>
                    </div>
                )}
            </div>

            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '32px',
                background: 'rgba(0,0,0,0.8)',
                borderTop: '1px solid var(--border-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                zIndex: 20,
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isConnected ? 'var(--accent-cyan)' : 'var(--res-ore)'
                    }} />
                    <span>{statusMessage}</span>
                </div>
                <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.72rem' }}>
                    {adapterSummary}
                </div>
            </div>
        </div>
    );
}

export default App;
