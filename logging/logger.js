const fs = require('fs');
const path = require('path');
const { normalizeLevel, shouldLog } = require('./log-levels');
const { resolveLoggingConfig } = require('./runtime');

function serializeValue(value, depth = 0) {
    if (value === null || value === undefined) {
        return value ?? null;
    }

    if (depth > 4) {
        if (Array.isArray(value)) {
            return `[array:${value.length}]`;
        }

        if (Buffer.isBuffer(value)) {
            return `[buffer:${value.length}]`;
        }

        if (value instanceof Error) {
            return {
                name: value.name,
                message: value.message
            };
        }

        if (typeof value === 'object') {
            return `[object:${Object.keys(value).length}]`;
        }
    }

    if (typeof value === 'bigint') {
        return value.toString();
    }

    if (Buffer.isBuffer(value)) {
        return {
            type: 'buffer',
            length: value.length,
            hex: value.subarray(0, 48).toString('hex')
        };
    }

    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
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

function createLogger(options = {}) {
    const {
        processName = 'app',
        rootDir = process.cwd(),
        minimumLevel,
        mirrorToConsole = true,
        onRecord
    } = options;

    const config = resolveLoggingConfig(rootDir);
    const effectiveLevel = normalizeLevel(minimumLevel || config.logLevel);
    const filePath = path.join(config.currentDir, `${processName}.jsonl`);
    const stream = fs.createWriteStream(filePath, { flags: 'a' });

    function write(level, message, context = {}) {
        const resolvedLevel = normalizeLevel(level);
        if (!shouldLog(resolvedLevel, effectiveLevel)) {
            return null;
        }

        const record = {
            timestamp: new Date().toISOString(),
            sessionId: config.sessionId,
            process: processName,
            level: resolvedLevel,
            message,
            pid: process.pid,
            context: serializeValue(context)
        };

        stream.write(`${JSON.stringify(record)}\n`);

        if (mirrorToConsole) {
            const consoleMessage = `[${processName}] ${resolvedLevel.toUpperCase()} ${message}`;
            if (resolvedLevel === 'error') {
                console.error(consoleMessage, record.context);
            } else if (resolvedLevel === 'warning') {
                console.warn(consoleMessage, record.context);
            } else {
                console.log(consoleMessage, record.context);
            }
        }

        if (typeof onRecord === 'function') {
            onRecord(record);
        }

        return record;
    }

    return {
        sessionId: config.sessionId,
        filePath,
        minimumLevel: effectiveLevel,
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
        },
        close() {
            stream.end();
        }
    };
}

module.exports = {
    createLogger,
    serializeValue
};
