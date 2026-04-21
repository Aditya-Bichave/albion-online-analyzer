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
