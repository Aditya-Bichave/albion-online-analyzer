import React, { useState } from 'react';
import { calculateProfit } from '../../utils/calculationUtils';
import { RECIPES } from '../../utils/recipeData';
import { getItemName } from '../../utils/itemNames';

const ProfitTable = ({ selectedItem, settings, prices, history, isLoading }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'ench', direction: 'asc' });

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
                Recipe not found for {getItemName(selectedItem)}.
            </div>
        );
    }

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (columnKey) => {
        if (sortConfig?.key === columnKey) {
            return <span>{sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽'}</span>;
        }
        return null;
    };

    // Render table
    const renderTable = (tier) => {
        const enchantments = [0, 1, 2, 3, 4];

        // Calculate all results first to sort them
        const rows = enchantments.map(ench => {
            const result = calculateProfit(selectedItem, tier, ench, settings, prices, history);
            return {
                ench,
                ...result
            };
        });

        // Apply sorting
        if (sortConfig) {
            rows.sort((a, b) => {
                const aValue = a[sortConfig.key] || 0;
                const bValue = b[sortConfig.key] || 0;
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

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
                            <th style={{ textAlign: 'left', padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('ench')}>
                                Enchant {getSortIndicator('ench')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('profit')}>
                                Profit/Loss {getSortIndicator('profit')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('profitPercentage')}>
                                % {getSortIndicator('profitPercentage')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('totalSaleValue')}>
                                Sale Value {getSortIndicator('totalSaleValue')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('totalMaterialCost')}>
                                Material Cost {getSortIndicator('totalMaterialCost')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('journalProfit')}>
                                Journal {getSortIndicator('journalProfit')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('itemsPerDay')} title="Estimated Items per Day">
                                Vol/Day {getSortIndicator('itemsPerDay')}
                            </th>
                            {settings.useFocus && (
                                <>
                                    <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('profitPerFocus')} title="Profit per Focus Point">
                                        Silver/Focus {getSortIndicator('profitPerFocus')}
                                    </th>
                                    <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('totalFocusRequired')} title="Focus needed per craft">
                                        Focus Cost {getSortIndicator('totalFocusRequired')}
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(row => {
                            const profitColor = row.profit > 0 ? 'var(--profit-positive)' :
                                              (row.profit < 0 ? 'var(--profit-negative)' : 'white');

                            return (
                                <tr key={row.ench} style={{ borderBottom: '1px solid #222' }}>
                                    <td style={{ textAlign: 'left', padding: '8px 4px' }}>.{row.ench}</td>
                                    <td style={{ padding: '8px 4px', color: profitColor }}>
                                        {row.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px', color: profitColor }}>
                                        {row.profitPercentage.toFixed(2)}%
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {row.totalSaleValue.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {row.totalMaterialCost.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {row.journalProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                    </td>
                                    <td style={{ padding: '8px 4px' }}>
                                        {row.itemsPerDay.toLocaleString(undefined, {maximumFractionDigits: 1})}
                                    </td>
                                    {settings.useFocus && (
                                        <>
                                            <td style={{ padding: '8px 4px', color: 'var(--accent-cyan)' }}>
                                                {row.profitPerFocus ? row.profitPerFocus.toLocaleString(undefined, {maximumFractionDigits: 2}) : 0}
                                            </td>
                                            <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>
                                                {row.totalFocusRequired ? row.totalFocusRequired.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                                            </td>
                                        </>
                                    )}
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
                <h2 style={{ margin: 0, fontSize: '24px' }}>{getItemName(selectedItem)}</h2>
                {isLoading && <span style={{ color: 'var(--text-secondary)' }}>Updating prices...</span>}
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '4px' }}>
                {recipe.tiers.map(tier => renderTable(tier))}
            </div>
        </div>
    );
};

export default ProfitTable;
