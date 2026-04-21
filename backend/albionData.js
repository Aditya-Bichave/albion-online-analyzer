const fs = require('fs');
const path = require('path');

const FRONTEND_ASSET_DIR = path.join(__dirname, '..', 'frontend', 'public', 'albion-assets');
const MOBS_OFFSET = 15;

function createNullLogger() {
    return {
        debug() {},
        info() {},
        warning() {},
        warn() {},
        error() {}
    };
}

function readJsonFile(filePath, logger) {
    try {
        if (!fs.existsSync(filePath)) {
            logger.warning('albion_data_file_missing', { filePath });
            return null;
        }

        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        logger.error('albion_data_file_failed', {
            filePath,
            error
        });
        return null;
    }
}

class ZoneCatalog {
    constructor(logger = createNullLogger()) {
        this.logger = logger;
        this.zones = {};
        this.loaded = false;
        this.load();
    }

    load() {
        const filePath = path.join(FRONTEND_ASSET_DIR, 'zones.json');
        const zones = readJsonFile(filePath, this.logger);
        if (!zones || typeof zones !== 'object' || Array.isArray(zones)) {
            return;
        }

        this.zones = zones;
        this.loaded = true;
    }

    getZone(zoneId) {
        if (!zoneId) {
            return null;
        }

        const id = String(zoneId);
        if (this.zones[id]) {
            return this.zones[id];
        }

        const baseId = id.split('-')[0];
        return this.zones[baseId] || null;
    }

    enrichZone(zoneInfo) {
        if (!zoneInfo) {
            return null;
        }

        const zone = this.getZone(zoneInfo.zoneId);
        return {
            zoneId: zoneInfo.zoneId || null,
            name: zone?.name || zoneInfo.name || zoneInfo.zoneId || 'Unknown Zone',
            mapSize: Number.isInteger(zoneInfo.mapSize) && zoneInfo.mapSize > 0 ? zoneInfo.mapSize : 1000,
            pvpType: zone?.pvpType || zoneInfo.pvpType || 'safe',
            tier: zone?.tier || zoneInfo.tier || 0,
            type: zone?.type || zoneInfo.type || '',
            mapAsset: zoneInfo.zoneId || null,
            mapFile: zone?.file || zoneInfo.mapFile || null
        };
    }
}

class MobCatalog {
    constructor(logger = createNullLogger()) {
        this.logger = logger;
        this.mobsById = new Map();
        this.loaded = false;
        this.load();
    }

    load() {
        const filePath = path.join(FRONTEND_ASSET_DIR, 'mobs.min.json');
        const mobs = readJsonFile(filePath, this.logger);
        if (!Array.isArray(mobs)) {
            return;
        }

        mobs.forEach((mob, index) => {
            const typeId = index + MOBS_OFFSET;
            this.mobsById.set(typeId, {
                typeId,
                uniqueName: mob?.u || '',
                tier: Number(mob?.t) || 0,
                category: mob?.c || '',
                locTag: mob?.n || '',
                resourceType: mob?.l || null,
                resourceTier: Number(mob?.lt) || Number(mob?.t) || 0,
                avatar: mob?.avatar || null,
                danger: mob?.danger || 'normal',
                hp: Number(mob?.hp) || 0,
                fame: Number(mob?.fame) || 0,
                isHarvestable: typeof mob?.l === 'string' && mob.l.trim() !== ''
            });
        });

        this.loaded = true;
    }

    getMobInfo(typeId) {
        return this.mobsById.get(Number(typeId)) || null;
    }
}

let zoneCatalogSingleton = null;
let mobCatalogSingleton = null;

function getZoneCatalog(logger) {
    if (!zoneCatalogSingleton) {
        zoneCatalogSingleton = new ZoneCatalog(logger);
    }

    return zoneCatalogSingleton;
}

function getMobCatalog(logger) {
    if (!mobCatalogSingleton) {
        mobCatalogSingleton = new MobCatalog(logger);
    }

    return mobCatalogSingleton;
}

module.exports = {
    getZoneCatalog,
    getMobCatalog
};
