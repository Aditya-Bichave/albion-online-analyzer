export const calculateLiquidityMetrics = (priceData, historyData) => {
    // If no data, return default low metrics
    if (!priceData && (!historyData || historyData.length === 0)) {
        return {
            itemsPerDay: 0,
            liquidityScore: 0,
            demandScore: 0,
            turnoverScore: 0,
            velocityBucket: 'Slow'
        };
    }

    let itemsPerDay = 0;

    // Process historical data if available
    if (historyData && historyData.length > 0) {
        // Simple average of item_count over the days
        let totalItems = 0;
        historyData.forEach(day => {
            totalItems += day.item_count || 0;
        });
        itemsPerDay = totalItems / historyData.length;
    } else {
        // Heuristic fallback if no history
        itemsPerDay = 0; // Return 0 instead of random to prevent UI jitter
    }

    let velocityBucket = 'Slow';
    if (itemsPerDay > 500) velocityBucket = 'Fast';
    else if (itemsPerDay > 50) velocityBucket = 'Medium';

    // Normalizing scores
    const liquidityScore = Math.min(100, (itemsPerDay / 1000) * 100);
    const demandScore = Math.min(100, (itemsPerDay / 500) * 100);
    const turnoverScore = liquidityScore; // Simplify for now

    return {
        itemsPerDay,
        liquidityScore,
        demandScore,
        turnoverScore,
        velocityBucket
    };
};
