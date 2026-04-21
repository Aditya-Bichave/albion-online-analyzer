function coerceNumber(value, fallback = Number.NaN) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    return fallback;
}

function extractCoordinateArray(value) {
    if (!Array.isArray(value) || value.length < 2) {
        return null;
    }

    const x = coerceNumber(value[0]);
    const y = coerceNumber(value[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return null;
    }

    return { x, y };
}

function createWorldEntityKey(kind, id) {
    return `${kind}:${id}`;
}

function toTitleCase(rawValue) {
    if (typeof rawValue !== 'string' || rawValue.trim() === '') {
        return '';
    }

    return rawValue
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase());
}

function clamp(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, value));
}

function classifyMobSeverity(mobInfo, parameters) {
    const category = mobInfo?.category || '';
    const danger = mobInfo?.danger || '';
    const rarity = coerceNumber(parameters?.[19], 0);
    const maxHealth = coerceNumber(parameters?.[13], 0);

    if (category === 'boss' || maxHealth >= 50000) {
        return 'boss';
    }

    if (category === 'miniboss') {
        return 'miniboss';
    }

    if (category === 'champion' || danger === 'elite' || rarity >= 180) {
        return 'elite';
    }

    if (danger === 'veteran' || rarity >= 100) {
        return 'veteran';
    }

    return 'normal';
}

function buildBaseEntity(kind, id, position, extra = {}) {
    return {
        uid: createWorldEntityKey(kind, id),
        id: String(id),
        kind,
        position,
        lastSeenAt: Date.now(),
        ttlMs: extra.ttlMs ?? 180000,
        ...extra
    };
}

function extractMobEntity(parameters, mobCatalog) {
    const id = coerceNumber(parameters?.[0]);
    const typeId = coerceNumber(parameters?.[1]);
    const position = extractCoordinateArray(parameters?.[7]) || extractCoordinateArray(parameters?.[8]);

    if (!Number.isFinite(id) || !Number.isFinite(typeId) || !position) {
        return null;
    }

    const mistName = typeof parameters?.[32] === 'string' && parameters[32].trim()
        ? parameters[32].trim()
        : null;
    if (mistName) {
        return buildBaseEntity('mist', id, position, {
            label: toTitleCase(mistName),
            name: mistName,
            enchant: clamp(coerceNumber(parameters?.[33], 0), 0, 4),
            rarity: coerceNumber(parameters?.[19], 0),
            threat: mistName.toLowerCase().includes('duo') ? 'duo' : 'solo',
            ttlMs: 240000
        });
    }

    const mobInfo = mobCatalog?.getMobInfo?.(typeId) || null;
    if (mobInfo?.isHarvestable) {
        return null;
    }

    const currentHealthNormalized = clamp(coerceNumber(parameters?.[2], 255), 0, 255);
    const maxHealth = Math.max(0, coerceNumber(parameters?.[13], mobInfo?.hp || 0));
    const healthPercent = Math.round((currentHealthNormalized / 255) * 100);
    const severity = classifyMobSeverity(mobInfo, parameters);

    return buildBaseEntity('mob', id, position, {
        label: toTitleCase(mobInfo?.uniqueName || `Mob ${typeId}`),
        typeId,
        tier: mobInfo?.tier || 0,
        category: mobInfo?.category || '',
        danger: severity,
        enchant: clamp(coerceNumber(parameters?.[33], 0), 0, 4),
        rarity: coerceNumber(parameters?.[19], 0),
        avatar: mobInfo?.avatar || null,
        healthPercent,
        currentHealth: maxHealth > 0 ? Math.round((healthPercent / 100) * maxHealth) : null,
        maxHealth: maxHealth || null,
        ttlMs: 120000
    });
}

function extractDungeonEntity(parameters) {
    const id = coerceNumber(parameters?.[0]);
    const position = extractCoordinateArray(parameters?.[1]);
    const rawName = typeof parameters?.[3] === 'string' ? parameters[3] : '';

    if (!Number.isFinite(id) || !position || !rawName) {
        return null;
    }

    const upperName = rawName.toUpperCase();
    let dungeonType = 'group';
    if (upperName.includes('CORRUPTED')) {
        dungeonType = 'corrupted';
    } else if (upperName.includes('HELLGATE')) {
        dungeonType = 'hellgate';
    } else if (upperName.includes('SOLO')) {
        dungeonType = 'solo';
    }

    const tierMatch = upperName.match(/T(\d)/);

    return buildBaseEntity('dungeon', id, position, {
        label: toTitleCase(rawName),
        dungeonType,
        tier: tierMatch ? Number(tierMatch[1]) : 0,
        enchant: Math.max(0, coerceNumber(parameters?.[6], 0) - 228),
        rawName,
        ttlMs: 300000
    });
}

function extractChestEntity(parameters) {
    const id = coerceNumber(parameters?.[0]);
    const position = extractCoordinateArray(parameters?.[1]);
    let label = typeof parameters?.[3] === 'string' ? parameters[3] : '';

    if (!Number.isFinite(id) || !position || !label) {
        return null;
    }

    if (label.toLowerCase().includes('mist') && typeof parameters?.[4] === 'string' && parameters[4]) {
        label = parameters[4];
    }

    return buildBaseEntity('chest', id, position, {
        label: toTitleCase(label),
        rarity: coerceNumber(parameters?.[5], 0),
        ttlMs: 300000
    });
}

function extractFishingEntity(parameters) {
    const id = coerceNumber(parameters?.[0]);
    const position = extractCoordinateArray(parameters?.[1]);

    if (!Number.isFinite(id) || !position) {
        return null;
    }

    const sizeSpawned = Math.max(0, coerceNumber(parameters?.[2], 0));
    const sizeLeftToSpawn = Math.max(0, coerceNumber(parameters?.[3], 0));
    const rawType = typeof parameters?.[4] === 'string' ? parameters[4].trim() : '';

    return buildBaseEntity('fishing', id, position, {
        label: rawType ? toTitleCase(rawType) : 'Fishing Pool',
        sizeSpawned,
        sizeLeftToSpawn,
        totalSize: sizeSpawned + sizeLeftToSpawn,
        ttlMs: 180000
    });
}

function extractCageEntity(parameters) {
    const id = coerceNumber(parameters?.[0]);
    const position = extractCoordinateArray(parameters?.[2]) || extractCoordinateArray(parameters?.[1]);
    const rawName = typeof parameters?.[4] === 'string'
        ? parameters[4]
        : (typeof parameters?.[2] === 'string' ? parameters[2] : '');

    if (!Number.isFinite(id) || !position || !rawName) {
        return null;
    }

    return buildBaseEntity('cage', id, position, {
        label: toTitleCase(rawName),
        rawName,
        ttlMs: 300000
    });
}

function extractWispEntity(parameters) {
    const id = coerceNumber(parameters?.[0]);
    const position = extractCoordinateArray(parameters?.[1]) || extractCoordinateArray(parameters?.[2]);

    if (!Number.isFinite(id) || !position) {
        return null;
    }

    const candidateLabel = [parameters?.[4], parameters?.[3], parameters?.[2]]
        .find(value => typeof value === 'string' && value.trim());

    return buildBaseEntity('wisp', id, position, {
        label: candidateLabel ? toTitleCase(candidateLabel) : 'Mists Wisp',
        state: coerceNumber(parameters?.[1], null),
        ttlMs: 240000
    });
}

function extractPlayerMoveRequest(parameters) {
    if (!parameters || typeof parameters !== 'object') {
        return null;
    }

    const position = extractCoordinateArray(parameters?.[1])
        || extractCoordinateArray(parameters?.[3])
        || extractCoordinateArray(parameters?.[2])
        || extractCoordinateArray(parameters?.[0]);

    return position ? {
        position,
        source: extractCoordinateArray(parameters?.[1]) ? 'parameters.1' : 'fallback',
        shape: 'array'
    } : null;
}

function extractPlayerJoinInfo(parameters) {
    const entityId = coerceNumber(parameters?.[0]);
    const name = typeof parameters?.[2] === 'string' ? parameters[2] : null;
    const position = extractCoordinateArray(parameters?.[9]) || extractCoordinateArray(parameters?.[60]) || null;

    return {
        entityId,
        name,
        position,
        positionSource: position ? (extractCoordinateArray(parameters?.[9]) ? 'parameters.9' : 'parameters.60') : null
    };
}

function extractHealthState(parameters) {
    const id = coerceNumber(parameters?.[0]);
    if (!Number.isFinite(id)) {
        return null;
    }

    const currentHealth = parameters?.[3];
    const normalizedHealth = parameters?.[2];

    return {
        id: String(id),
        currentHealth: Number.isFinite(currentHealth) ? currentHealth : null,
        normalizedHealth: Number.isFinite(normalizedHealth) ? normalizedHealth : null
    };
}

module.exports = {
    createWorldEntityKey,
    extractMobEntity,
    extractDungeonEntity,
    extractChestEntity,
    extractFishingEntity,
    extractCageEntity,
    extractWispEntity,
    extractPlayerMoveRequest,
    extractPlayerJoinInfo,
    extractHealthState
};
