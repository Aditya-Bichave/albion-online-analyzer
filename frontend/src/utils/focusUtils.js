export const calculateFocusMetrics = (profitResult, focusNeeded) => {
    if (!profitResult || !focusNeeded) return null;

    // Calculate basic metrics from the base result and focus efficiency
    const { profit } = profitResult;

    // How much focus required for the batch being calculated (usually 1 if numberSold=1)
    const totalFocusRequired = focusNeeded;

    // Silver generated per point of focus used
    const silverPerFocus = totalFocusRequired > 0 ? (profit / totalFocusRequired) : 0;

    // Theoretical max profit if we dumped all 10000 daily focus cap into this item
    const dailyCap = 10000;
    const craftsUnderCap = totalFocusRequired > 0 ? Math.floor(dailyCap / totalFocusRequired) : 0;
    const dailyProfitAtCap = craftsUnderCap * profit;

    return {
        profitPerFocus: silverPerFocus,
        silverPerFocus,
        totalFocusRequired,
        craftsUnderCap,
        dailyProfitAtCap
    };
};
