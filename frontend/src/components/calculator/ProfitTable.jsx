import React from 'react';
import { calculateProfit } from '../../utils/calculationUtils';
import { RECIPES } from '../../utils/recipeData';

const ProfitTable = ({ selectedItem, settings, prices, isLoading }) => {
    if (!selectedItem) {
        return (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                Please select an item from the craft branch.
            </div>
        );
    }

    const recipe = RECIPES[selectedItem];
    if (!recipe) {
        return (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>
                Recipe not found for {selectedItem}.
            </div>
        );
    }

    // Render table
    const renderTable = (tier) => {
        const enchantments = [0, 1, 2, 3, 4];

        return (
            <div key={tier} style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Tier {tier}</h3>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px',
                    textAlign: 'right'
                }}>
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #333' }}>
                            <th style={{ textAlign: 'left', padding: '8px 4px' }}>Enchant</th>
                            <th style={{ padding: '8px 4px' }}>Profit/Loss</th>
                            <th style={{ padding: '8px 4px' }}>%</th>
                            <th style={{ padding: '8px 4px' }}>Sale Value</th>
                            <th style={{ padding: '8px 4px' }}>Material Cost</th>
                            <th style={{ padding: '8px 4px' }}>Journal</th>
                            <th style={{ padding: '8px 4px' }}>Items/Day</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enchantments.map(ench => {
                            const result = calculateProfit(selectedItem, tier, ench, settings, prices);

                            // If we don't have enough data to calculate properly, we could show N/A
                            // But we'll try to show what we have
                            const profitColor = result.profit > 0 ? 'var(--profit-positive)' :
                                              (result.profit < 0 ? 'var(--profit-negative)' : 'white');

                            return (
                                <tr key={ench} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ textAlign: 'left', padding: '8px 4px' }}>.{ench}</td>
                                    <td style={{ padding: '8px 4px', color: profitColor }}>
                                        {result.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px', color: profitColor }}>
                                        {result.profitPercentage.toFixed(2)}%
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {result.totalSaleValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {result.totalMaterialCost.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {result.journalProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {result.itemsPerDay.toLocaleString(undefined, {maximumFractionDigits: 1})}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', color: 'white', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedItem}</h2>
                {isLoading && <span style={{ color: 'var(--text-secondary)' }}>Updating prices...</span>}
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '4px' }}>
                {recipe.tiers.map(tier => renderTable(tier))}
            </div>
        </div>
    );
};

export default ProfitTable;
