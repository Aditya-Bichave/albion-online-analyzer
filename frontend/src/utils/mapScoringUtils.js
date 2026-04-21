export const calculateNodeScore = (node, weights) => {
    let score = 0;

    if (weights.valueWeight && node.value) score += node.value * weights.valueWeight;
    if (weights.spmWeight && node.spm) score += node.spm * weights.spmWeight;
    if (weights.enchantWeight && node.enchant > 0) score += (node.enchant * 1000) * weights.enchantWeight;
    if (weights.tierWeight) score += (node.tier * 500) * weights.tierWeight;

    return score;
};

export const normalizeScore = (value, min, max) => {
    if (max === min) return 0.5;
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

export const getValueColor = (value, minVal, maxVal) => {
    const ratio = normalizeScore(value, minVal, maxVal);
    // Dark red (low) -> Yellow (mid) -> Bright Green (high)
    // We'll return an HSL color string
    const hue = ratio * 120; // 0 = red, 120 = green
    const saturation = 80 + (ratio * 20); // 80% to 100%
    const lightness = 40 + (ratio * 20); // 40% to 60%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
