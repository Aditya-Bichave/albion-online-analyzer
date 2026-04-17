const LEVEL_PRIORITY = Object.freeze({
    verbose: 10,
    debug: 20,
    info: 30,
    warning: 40,
    error: 50
});

function normalizeLevel(level, fallback = 'info') {
    if (typeof level !== 'string') {
        return fallback;
    }

    const normalized = level.trim().toLowerCase();
    if (normalized === 'warn') {
        return 'warning';
    }

    return Object.prototype.hasOwnProperty.call(LEVEL_PRIORITY, normalized)
        ? normalized
        : fallback;
}

function shouldLog(level, minimumLevel) {
    return LEVEL_PRIORITY[normalizeLevel(level)] >= LEVEL_PRIORITY[normalizeLevel(minimumLevel)];
}

function serializeValue(value, depth = 0) {
    if (value === null || value === undefined) {
        return value ?? null;
    }

    if (depth > 4) {
        if (Array.isArray(value)) {
            return `[array:${value.length}]`;
        }

        if (typeof value === 'object') {
            return `[object:${Object.keys(value).length}]`;
        }
    }

    if (Array.isArray(value)) {
        return value.map(item => serializeValue(item, depth + 1));
    }

    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, nested]) => [key, serializeValue(nested, depth + 1)])
        );
    }

    return value;
}

export function createRendererLogger({ getSocket, getMinimumLevel, onLocalRecord }) {
    const pending = [];
    const maxPending = 300;

    const emitConsole = (record) => {
        const prefix = `[frontend] ${record.level.toUpperCase()} ${record.message}`;
        if (record.level === 'error') {
            console.error(prefix, record.context);
        } else if (record.level === 'warning') {
            console.warn(prefix, record.context);
        } else {
            console.log(prefix, record.context);
        }
    };

    const flush = () => {
        const socket = getSocket?.();
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }

        while (pending.length > 0) {
            const record = pending.shift();
            socket.send(JSON.stringify({
                command: 'CLIENT_LOG',
                data: record
            }));
        }
    };

    const write = (level, message, context = {}) => {
        const minimumLevel = normalizeLevel(getMinimumLevel?.() || 'info');
        const resolvedLevel = normalizeLevel(level);
        if (!shouldLog(resolvedLevel, minimumLevel)) {
            return null;
        }

        const record = {
            timestamp: new Date().toISOString(),
            level: resolvedLevel,
            message,
            context: serializeValue(context)
        };

        emitConsole(record);
        onLocalRecord?.(record);

        const socket = getSocket?.();
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                command: 'CLIENT_LOG',
                data: record
            }));
        } else {
            pending.push(record);
            if (pending.length > maxPending) {
                pending.shift();
            }
        }

        return record;
    };

    return {
        flush,
        verbose(message, context) {
            return write('verbose', message, context);
        },
        debug(message, context) {
            return write('debug', message, context);
        },
        info(message, context) {
            return write('info', message, context);
        },
        warning(message, context) {
            return write('warning', message, context);
        },
        warn(message, context) {
            return write('warning', message, context);
        },
        error(message, context) {
            return write('error', message, context);
        }
    };
}
