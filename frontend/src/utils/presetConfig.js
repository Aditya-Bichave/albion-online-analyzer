export const PRESETS = [
    {
        id: "default",
        label: "Default",
        filters: { types: ['wood', 'ore', 'fiber', 'hide', 'stone'], tiers: [1, 2, 3, 4, 5, 6, 7, 8], minEnchant: 0 },
        routeWeights: { valueWeight: 1, enchantWeight: 0, tierWeight: 0, distancePenalty: 1, densityBonus: 1 },
        colorMode: "type" // "type", "profit", "spm", "route"
    },
    {
        id: "profit-mode",
        label: "Profit Mode",
        filters: { types: ['wood', 'ore', 'fiber', 'hide', 'stone'], tiers: [4, 5, 6, 7, 8], minEnchant: 0 },
        routeWeights: { valueWeight: 2.0, spmWeight: 1.5, enchantWeight: 1, tierWeight: 0.5, distancePenalty: 1.2, densityBonus: 1.5 },
        colorMode: "profit"
    },
    {
        id: "fiber-run",
        label: "Fiber Run",
        filters: { types: ['fiber'], tiers: [3, 4, 5, 6, 7, 8], minEnchant: 0 },
        routeWeights: { valueWeight: 1, enchantWeight: 0.5, tierWeight: 1, distancePenalty: 0.8, densityBonus: 2.0 },
        colorMode: "type"
    },
    {
        id: "high-tier",
        label: "High-tier Only",
        filters: { types: ['wood', 'ore', 'fiber', 'hide', 'stone'], tiers: [6, 7, 8], minEnchant: 0 },
        routeWeights: { valueWeight: 1.5, enchantWeight: 1, tierWeight: 3.0, distancePenalty: 1.0, densityBonus: 1.0 },
        colorMode: "type"
    },
    {
        id: "enchanted-only",
        label: "Enchanted Only",
        filters: { types: ['wood', 'ore', 'fiber', 'hide', 'stone'], tiers: [4, 5, 6, 7, 8], minEnchant: 1 },
        routeWeights: { valueWeight: 1.5, enchantWeight: 3.0, tierWeight: 0.5, distancePenalty: 1.5, densityBonus: 0.5 },
        colorMode: "profit"
    },
    {
        id: "safe-farming",
        label: "Safe Farming",
        filters: { types: ['wood', 'ore', 'fiber', 'hide', 'stone'], tiers: [2, 3, 4, 5], minEnchant: 0 },
        routeWeights: { valueWeight: 1, enchantWeight: 1, tierWeight: 0.5, distancePenalty: 2.5, densityBonus: 2.0 },
        colorMode: "spm"
    },
    {
        id: "experience-run",
        label: "Experience Run",
        filters: { types: ['wood', 'ore', 'fiber', 'hide', 'stone'], tiers: [4, 5, 6, 7, 8], minEnchant: 0 },
        routeWeights: { valueWeight: 0.5, enchantWeight: 0, tierWeight: 2.0, distancePenalty: 1.0, densityBonus: 3.0 },
        colorMode: "type"
    }
];

export const getColorModeLabel = (mode) => {
    switch (mode) {
        case 'type': return 'Resource Type';
        case 'profit': return 'Profit Value';
        case 'spm': return 'Silver/Minute';
        case 'route': return 'Route Priority';
        case 'density': return 'Cluster Density';
        default: return 'Unknown';
    }
};
