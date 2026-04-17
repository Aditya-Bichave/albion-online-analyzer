const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { normalizeLevel } = require('./log-levels');

function parseBoolean(value, fallback = false) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on'].includes(normalized)) {
        return true;
    }

    if (['0', 'false', 'no', 'off'].includes(normalized)) {
        return false;
    }

    return fallback;
}

function ensureDirSync(targetDir) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function safeSessionId(value) {
    return String(value || '')
        .trim()
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function createSessionId(date = new Date()) {
    const iso = date.toISOString().replace(/[:.]/g, '-');
    return safeSessionId(`${iso}-${process.pid}`) || `session-${process.pid}`;
}

function getLogRootDir(rootDir) {
    return process.env.LOG_DIR || path.join(rootDir, 'logs');
}

function getCurrentLogDir(rootDir) {
    return process.env.ALALYZER_LOG_CURRENT_DIR || path.join(getLogRootDir(rootDir), 'current');
}

function getArchiveLogDir(rootDir) {
    return process.env.ALALYZER_LOG_ARCHIVE_DIR || path.join(getLogRootDir(rootDir), 'archive');
}

function readDirectoryEntries(targetDir) {
    if (!fs.existsSync(targetDir)) {
        return [];
    }

    return fs.readdirSync(targetDir, { withFileTypes: true });
}

function archiveCurrentLogs(rootDir) {
    const currentDir = getCurrentLogDir(rootDir);
    const archiveRoot = getArchiveLogDir(rootDir);

    if (!fs.existsSync(currentDir)) {
        return null;
    }

    const currentEntries = readDirectoryEntries(currentDir);
    if (currentEntries.length === 0) {
        fs.rmSync(currentDir, { recursive: true, force: true });
        return null;
    }

    let previousSessionId = null;
    const metadataPath = path.join(currentDir, 'session.json');
    if (fs.existsSync(metadataPath)) {
        try {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            previousSessionId = safeSessionId(metadata.sessionId);
        } catch {
            previousSessionId = null;
        }
    }

    const archiveSessionDir = path.join(
        archiveRoot,
        previousSessionId || `archived-${createSessionId()}`
    );

    ensureDirSync(archiveSessionDir);

    for (const entry of currentEntries) {
        if (!entry.isFile()) {
            continue;
        }

        const sourcePath = path.join(currentDir, entry.name);
        const targetPath = path.join(archiveSessionDir, `${entry.name}.gz`);
        const content = fs.readFileSync(sourcePath);
        fs.writeFileSync(targetPath, zlib.gzipSync(content));
    }

    fs.rmSync(currentDir, { recursive: true, force: true });
    pruneArchivedSessions(archiveRoot, 5);
    return archiveSessionDir;
}

function pruneArchivedSessions(archiveRoot, maxSessions) {
    if (!fs.existsSync(archiveRoot)) {
        return;
    }

    const sessionDirs = fs.readdirSync(archiveRoot, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => {
            const fullPath = path.join(archiveRoot, entry.name);
            const stats = fs.statSync(fullPath);
            return {
                fullPath,
                mtimeMs: stats.mtimeMs
            };
        })
        .sort((left, right) => right.mtimeMs - left.mtimeMs);

    for (const stale of sessionDirs.slice(maxSessions)) {
        fs.rmSync(stale.fullPath, { recursive: true, force: true });
    }
}

function initializeLoggingSession(rootDir) {
    const logRootDir = getLogRootDir(rootDir);
    ensureDirSync(logRootDir);
    archiveCurrentLogs(rootDir);

    const sessionId = safeSessionId(process.env.ALALYZER_SESSION_ID) || createSessionId();
    const currentDir = path.join(logRootDir, 'current');
    const archiveDir = path.join(logRootDir, 'archive');
    ensureDirSync(currentDir);
    ensureDirSync(archiveDir);

    const loggingEnvironment = {
        LOG_DIR: logRootDir,
        LOG_LEVEL: normalizeLevel(process.env.LOG_LEVEL || 'info'),
        LOG_PACKET_VERBOSE: String(parseBoolean(process.env.LOG_PACKET_VERBOSE, false)),
        LOG_UI_STREAM_LEVEL: normalizeLevel(process.env.LOG_UI_STREAM_LEVEL || 'info'),
        ALALYZER_SESSION_ID: sessionId,
        ALALYZER_LOG_CURRENT_DIR: currentDir,
        ALALYZER_LOG_ARCHIVE_DIR: archiveDir
    };

    const metadata = {
        sessionId,
        startedAt: new Date().toISOString(),
        pid: process.pid,
        logLevel: loggingEnvironment.LOG_LEVEL,
        packetVerbose: parseBoolean(loggingEnvironment.LOG_PACKET_VERBOSE, false),
        uiStreamLevel: loggingEnvironment.LOG_UI_STREAM_LEVEL
    };

    fs.writeFileSync(
        path.join(currentDir, 'session.json'),
        JSON.stringify(metadata, null, 2),
        'utf8'
    );

    return {
        sessionId,
        logRootDir,
        currentDir,
        archiveDir,
        environment: loggingEnvironment,
        metadata
    };
}

function resolveLoggingConfig(rootDir) {
    const logRootDir = getLogRootDir(rootDir);
    const currentDir = getCurrentLogDir(rootDir);
    const archiveDir = getArchiveLogDir(rootDir);
    ensureDirSync(logRootDir);
    ensureDirSync(currentDir);
    ensureDirSync(archiveDir);

    return {
        logRootDir,
        currentDir,
        archiveDir,
        sessionId: safeSessionId(process.env.ALALYZER_SESSION_ID) || createSessionId(),
        logLevel: normalizeLevel(process.env.LOG_LEVEL || 'info'),
        packetVerbose: parseBoolean(process.env.LOG_PACKET_VERBOSE, false),
        uiStreamLevel: normalizeLevel(process.env.LOG_UI_STREAM_LEVEL || 'info')
    };
}

module.exports = {
    archiveCurrentLogs,
    createSessionId,
    getArchiveLogDir,
    getCurrentLogDir,
    getLogRootDir,
    initializeLoggingSession,
    parseBoolean,
    resolveLoggingConfig
};
