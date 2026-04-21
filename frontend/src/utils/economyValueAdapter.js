// Fallback valuation layer for resource nodes
// This can be plugged into real market API values later.

const BASE_PRICES = {
    1: 2,
    2: 5,
    3: 15,
    4: 50,
    5: 150,
    6: 400,
    7: 1200,
    8: 3000
};

const ENCHANT_MULTIPLIER = {
    0: 1,
    1: 2.5,
    2: 5,
    3: 12,
    4: 30
};

const GATHER_TIMES_SECONDS = {
    1: 1.5,
    2: 2,
    3: 2.5,
    4: 3,
    5: 4,
    6: 5,
    7: 6,
    8: 7
};

export const getEstimatedNodeValue = (node) => {
    const basePrice = BASE_PRICES[node.tier] || 0;
    const enchantMult = ENCHANT_MULTIPLIER[node.enchant] || 1;
    const charges = node.charges || 1;

    // An average yield per charge can be factored in, say 1 item per charge
    return basePrice * enchantMult * charges;
};

export const getEstimatedSilverPerMinute = (node) => {
    const totalValue = getEstimatedNodeValue(node);
    const timeToGather = (GATHER_TIMES_SECONDS[node.tier] || 3) * (node.charges || 1);

    // Add travel time approximation per node, e.g. 5 seconds
    const cycleTime = timeToGather + 5;

    return (totalValue / cycleTime) * 60;
};

// Returns enriched node data
export const enrichNodeEconomy = (node) => {
    return {
        ...node,
        value: getEstimatedNodeValue(node),
        spm: getEstimatedSilverPerMinute(node)
    };
};
