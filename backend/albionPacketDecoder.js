const EVENT_NAMES = {
    1: 'Leave',
    2: 'JoinFinished',
    3: 'Move',
    4: 'Teleport',
    38: 'NewSimpleHarvestableObject',
    39: 'NewSimpleHarvestableObjectList',
    40: 'NewHarvestableObject',
    46: 'HarvestableChangeState',
    59: 'HarvestStart',
    60: 'HarvestCancel',
    61: 'HarvestFinished',
    98: 'NewLoot',
    106: 'GuildMemberWorldUpdate',
    123: 'NewMob',
    140: 'ClusterInfoUpdate',
    193: 'MiniMapOwnedBuildingsPositions',
    325: 'PlayerMovementRateUpdate',
    390: 'RandomDungeonPositionInfo',
    442: 'NewRandomResourceBlocker',
    446: 'MinimapPositionMarkers',
    477: 'RedZoneWorldMapEvent'
};

const REQUEST_NAMES = {
    21: 'PlayerMoving'
};

const RESPONSE_NAMES = {
    2: 'PlayerJoiningMap',
    35: 'PlayerChangeCluster',
    137: 'GetCharacterStats'
};

const RELEVANT_EVENT_CODES = new Set([3, 29, 38, 39, 40, 46, 59, 60, 61, 123, 140, 446]);
const RELEVANT_REQUEST_CODES = new Set([21]);
const RELEVANT_RESPONSE_CODES = new Set([2, 35]);

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value);
}

function tryGetShortCode(value) {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value & 0xffff;
    }

    return null;
}

function normalizePackedEventCode(code) {
    const shiftedByNibble = code >> 4;
    if ((code & 0x0f) === 0x01 && EVENT_NAMES[shiftedByNibble]) {
        return shiftedByNibble;
    }

    return null;
}

function extractAlbionEventCode(packet) {
    const packed = tryGetShortCode(packet?.parameters?.[252]);
    if (packed !== null) {
        if (EVENT_NAMES[packed]) {
            return packed;
        }

        const normalized = normalizePackedEventCode(packed);
        if (normalized !== null) {
            return normalized;
        }
    }

    if (packet?.code === 3) {
        return 3;
    }

    if (typeof packet?.code === 'number' && Number.isFinite(packet.code) && EVENT_NAMES[packet.code]) {
        return packet.code;
    }

    return typeof packet?.code === 'number' ? packet.code : null;
}

function summarizeValue(value, depth = 0) {
    if (value === null || value === undefined) {
        return value ?? null;
    }

    if (depth >= 2) {
        if (Array.isArray(value)) {
            return `[array:${value.length}]`;
        }

        if (Buffer.isBuffer(value)) {
            return `[bytes:${value.length}]`;
        }

        if (isPlainObject(value)) {
            return `[object:${Object.keys(value).length}]`;
        }

        return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        return value.length > 120 ? `${value.slice(0, 120)}...` : value;
    }

    if (typeof value === 'bigint') {
        return value.toString();
    }

    if (Buffer.isBuffer(value)) {
        return {
            type: 'bytes',
            length: value.length,
            hex: value.subarray(0, 16).toString('hex')
        };
    }

    if (Array.isArray(value)) {
        return {
            type: 'array',
            length: value.length,
            items: value.slice(0, 6).map(item => summarizeValue(item, depth + 1))
        };
    }

    if (value.kind === 'dictionary' || value.kind === 'hashtable') {
        return {
            type: value.kind,
            length: value.entries.length,
            entries: value.entries.slice(0, 5).map(entry => ({
                key: summarizeValue(entry.key, depth + 1),
                value: summarizeValue(entry.value, depth + 1)
            }))
        };
    }

    if (isPlainObject(value)) {
        const output = {};
        const entries = Object.entries(value).slice(0, 12);
        for (const [key, nestedValue] of entries) {
            output[key] = summarizeValue(nestedValue, depth + 1);
        }
        return output;
    }

    return String(value);
}

function decodeAlbionPacket(packet) {
    if (!packet || packet.kind === 'decode_error') {
        return null;
    }

    if (packet.kind === 'request') {
        const code = tryGetShortCode(packet?.parameters?.[253]) ?? packet.operationCode;
        if (typeof code !== 'number') {
            return null;
        }

        return {
            kind: 'request',
            code,
            name: REQUEST_NAMES[code] || `Request ${code}`,
            relevant: RELEVANT_REQUEST_CODES.has(code),
            payloadPreview: packet.payloadPreview,
            keys: Object.keys(packet.parameters || {}),
            parameters: summarizeValue(packet.parameters || {})
        };
    }

    if (packet.kind === 'response') {
        const code = tryGetShortCode(packet?.parameters?.[253]) ?? packet.operationCode;
        if (typeof code !== 'number') {
            return null;
        }

        return {
            kind: 'response',
            code,
            name: RESPONSE_NAMES[code] || `Response ${code}`,
            relevant: RELEVANT_RESPONSE_CODES.has(code),
            payloadPreview: packet.payloadPreview,
            keys: Object.keys(packet.parameters || {}),
            parameters: summarizeValue(packet.parameters || {})
        };
    }

    if (packet.kind === 'event') {
        const eventCode = extractAlbionEventCode(packet);
        if (eventCode === null) {
            return null;
        }

        return {
            kind: 'event',
            code: eventCode,
            name: EVENT_NAMES[eventCode] || `Event ${eventCode}`,
            relevant: RELEVANT_EVENT_CODES.has(eventCode),
            payloadPreview: packet.payloadPreview,
            keys: Object.keys(packet.parameters || {}),
            parameters: summarizeValue(packet.parameters || {})
        };
    }

    return null;
}

module.exports = {
    decodeAlbionPacket
};
