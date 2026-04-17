const RESOURCES = {
    WOOD: 'wood',
    ORE: 'ore',
    FIBER: 'fiber',
    HIDE: 'hide',
    STONE: 'stone'
};

const TIERS = [1, 2, 3, 4, 5, 6, 7, 8];
const ENCHANTS = [0, 1, 2, 3, 4]; // .0=normal, .1=uncommon, .2=rare, .3=exceptional, .4=pristine

// Helper to get random resource depending on tier limits
function getRandomResource() {
    const keys = Object.keys(RESOURCES);
    const res = RESOURCES[keys[Math.floor(Math.random() * keys.length)]];
    
    // Tiers mostly 2-8 for gathering, let's simplify 1-8
    let tier = Math.floor(Math.random() * 8) + 1;
    let enchant = 0;

    // Enchants usually available T4+
    if (tier >= 4) {
        // Higher enchants are rare
        const r = Math.random();
        if (r > 0.95) enchant = 4;
        else if (r > 0.85) enchant = 3;
        else if (r > 0.65) enchant = 2;
        else if (r > 0.40) enchant = 1;
        else enchant = 0;
    }

    return { type: res, tier, enchant };
}

module.exports = {
    RESOURCES,
    TIERS,
    ENCHANTS,
    getRandomResource
};
