export const getResourceColor = (type) => {
    switch (type) {
        case 'wood': return 'var(--res-wood)';
        case 'ore': return 'var(--res-ore)';
        case 'fiber': return 'var(--res-fiber)';
        case 'hide': return 'var(--res-hide)';
        case 'stone': return 'var(--res-stone)';
        default: return '#ffffff';
    }
};

export const getEnchantColor = (enchant) => {
    switch (enchant) {
        case 1: return 'var(--ench-1)';
        case 2: return 'var(--ench-2)';
        case 3: return 'var(--ench-3)';
        case 4: return 'var(--ench-4)';
        default: return 'transparent'; // .0
    }
};

export const getThreatColor = (threat) => {
    switch (threat) {
        case 'hostile': return '#ff5d5d';
        case 'faction': return '#ffb347';
        case 'passive': return '#4ade80';
        default: return '#cbd5e1';
    }
};

export const formatThreatLabel = (threat) => {
    switch (threat) {
        case 'hostile': return 'Hostile';
        case 'faction': return 'Faction';
        case 'passive': return 'Passive';
        default: return 'Unknown';
    }
};

export const getZonePvpColor = (pvpType) => {
    switch (pvpType) {
        case 'black': return '#ff4d6d';
        case 'red': return '#ff7b54';
        case 'yellow': return '#facc15';
        case 'safe': return '#4ade80';
        default: return '#94a3b8';
    }
};

export const getWorldEntityColor = (entity) => {
    if (!entity) return '#cbd5e1';

    switch (entity.kind) {
        case 'mob':
            switch (entity.danger) {
                case 'boss': return '#f97316';
                case 'miniboss': return '#facc15';
                case 'elite': return '#c084fc';
                case 'veteran': return '#60a5fa';
                default: return '#fb7185';
            }
        case 'mist': return '#7dd3fc';
        case 'wisp': return '#a78bfa';
        case 'cage': return '#f59e0b';
        case 'dungeon': return '#34d399';
        case 'chest': return '#fbbf24';
        case 'fishing': return '#38bdf8';
        default: return '#cbd5e1';
    }
};

export const formatWorldEntityKind = (kind) => {
    switch (kind) {
        case 'mob': return 'Mobs';
        case 'mist': return 'Mists';
        case 'wisp': return 'Wisps';
        case 'cage': return 'Cages';
        case 'dungeon': return 'Dungeons';
        case 'chest': return 'Chests';
        case 'fishing': return 'Fishing';
        default: return 'Unknown';
    }
};

export const formatMobDanger = (danger) => {
    switch (danger) {
        case 'boss': return 'Boss';
        case 'miniboss': return 'Mini Boss';
        case 'elite': return 'Elite';
        case 'veteran': return 'Veteran';
        default: return 'Normal';
    }
};

export const getChestRarityLabel = (rarity) => {
    switch (rarity) {
        case 1: return 'Common';
        case 2: return 'Uncommon';
        case 3: return 'Rare';
        case 4: return 'Epic';
        case 5: return 'Legendary';
        default: return rarity ? `Tier ${rarity}` : 'Chest';
    }
};

export const getWorldEntityImageCandidates = (entity) => {
    if (!entity?.avatar) {
        return [];
    }

    const orderedDirs = [];
    if (entity.danger === 'boss') orderedDirs.push('Boss');
    if (entity.danger === 'miniboss') orderedDirs.push('MiniBoss');
    if (entity.danger === 'elite') orderedDirs.push('Enchanted');
    if (entity.danger === 'veteran') orderedDirs.push('Medium');
    orderedDirs.push('Normal', 'Medium', 'Enchanted', 'MiniBoss', 'Boss');

    return [...new Set(orderedDirs)].map(dir => `/albion-assets/enemies/${dir}/${entity.avatar}.webp`);
};
