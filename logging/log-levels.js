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

function shouldLog(level, minimumLevel = 'info') {
    const resolvedLevel = normalizeLevel(level);
    const resolvedMinimum = normalizeLevel(minimumLevel);
    return LEVEL_PRIORITY[resolvedLevel] >= LEVEL_PRIORITY[resolvedMinimum];
}

module.exports = {
    LEVEL_PRIORITY,
    normalizeLevel,
    shouldLog
};
