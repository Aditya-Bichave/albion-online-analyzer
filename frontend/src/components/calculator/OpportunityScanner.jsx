import React, { useState } from 'react';
import { RECIPES } from '../../utils/recipeData';
import { calculateProfit } from '../../utils/calculationUtils';
import { getItemName } from '../../utils/itemNames';
import { SERVERS } from '../../utils/constants';

const OpportunityScanner = ({ settings, onSelectOpportunity }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState([]);
    const [progress, setProgress] = useState(0);
    const [sortConfig, setSortConfig] = useState({ key: 'profit', direction: 'desc' });

    // Filters
    const [filters, setFilters] = useState({
        minTier: 4,
        maxTier: 8,
        minEnchant: 0,
        maxEnchant: 4,
        minProfit: 0,
        minRoi: 0,
        minLiquidity: 0,
        searchTerm: ''
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

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

    const getCategoryForRecipe = (itemName) => {
        // Simplified category finding based on item name suffix
        return itemName.split('_')[1] || 'Unknown';
    };

    const scanAll = async () => {
        setIsScanning(true);
        setScanResults([]);
        setProgress(0);

        const allItems = Object.keys(RECIPES);
        const totalItems = allItems.length;
        let processedItems = 0;
        let results = [];

        const chunkSize = 15; // smaller chunk for history
        for (let i = 0; i < allItems.length; i += chunkSize) {
            const chunk = allItems.slice(i, i + chunkSize);

            const itemsToFetch = [];
            chunk.forEach(itemName => {
                const recipe = RECIPES[itemName];
                recipe.tiers.forEach(tier => {
                    if (tier >= filters.minTier && tier <= filters.maxTier) {
                        itemsToFetch.push(`T${tier}_${recipe.itemSuffix}`);
                        Object.keys(recipe.ingredients).forEach(mat => {
                            if (mat.startsWith('T1_FACTION_')) {
                                itemsToFetch.push(mat);
                            } else {
                                itemsToFetch.push(`T${tier}_${mat}`);
                            }
                        });
                        if (settings.useJournals && recipe.journal) {
                            itemsToFetch.push(`T${tier}_JOURNAL_${recipe.journal}_EMPTY`, `T${tier}_JOURNAL_${recipe.journal}_FULL`);
                        }
                    }
                });
            });

            const fullItemsToFetch = [];
            itemsToFetch.forEach(item => {
                fullItemsToFetch.push(item);
                for(let e=1; e<=4; e++) {
                    if (e >= filters.minEnchant && e <= filters.maxEnchant) {
                        fullItemsToFetch.push(`${item}@${e}`);
                    }
                }
            });

            const uniqueItems = [...new Set(fullItemsToFetch)];
            if (uniqueItems.length === 0) continue;

            const itemsQuery = uniqueItems.join(',');
            const locationsQuery = settings.useMultipleCities ? '' : `?locations=${settings.mainCity}`;
            const serverConfig = SERVERS.find(s => s.id === settings.server) || SERVERS[0];

            const url = `${serverConfig.url}prices/${itemsQuery}${locationsQuery}`;
            const historyUrl = `${serverConfig.url}history/${itemsQuery}?locations=${settings.mainCity}&time-scale=24&qualities=1`;

            try {
                const [priceRes, historyRes] = await Promise.all([
                    fetch(url).catch(() => null),
                    fetch(historyUrl).catch(() => null)
                ]);

                let data = [];
                let historyData = [];
                if (priceRes && priceRes.ok) data = await priceRes.json();
                if (historyRes && historyRes.ok) historyData = await historyRes.json();

                const priceMap = {};
                data.forEach(entry => {
                    if (settings.useMultipleCities) {
                        if (!priceMap[entry.item_id] || (entry.sell_price_min > 0 && (priceMap[entry.item_id].sell_price_min === 0 || entry.sell_price_min < priceMap[entry.item_id].sell_price_min))) {
                            priceMap[entry.item_id] = entry;
                        }
                    } else if (entry.city === settings.mainCity) {
                        priceMap[entry.item_id] = entry;
                    }
                });

                const historyMap = {};
                if (Array.isArray(historyData)) {
                    historyData.forEach(entry => {
                        if (entry.location === settings.mainCity && entry.data) {
                            historyMap[entry.item_id] = entry.data;
                        }
                    });
                }

                chunk.forEach(itemName => {
                    const recipe = RECIPES[itemName];
                    const category = getCategoryForRecipe(itemName);
                    recipe.tiers.forEach(tier => {
                        if (tier < filters.minTier || tier > filters.maxTier) return;
                        [0,1,2,3,4].forEach(ench => {
                            if (ench < filters.minEnchant || ench > filters.maxEnchant) return;

                            const result = calculateProfit(itemName, tier, ench, settings, priceMap, historyMap);

                            if (result.profit >= filters.minProfit &&
                                result.profitPercentage >= filters.minRoi &&
                                result.itemsPerDay >= filters.minLiquidity) {
                                results.push({
                                    itemName,
                                    category,
                                    tier,
                                    ench,
                                    ...result
                                });
                            }
                        });
                    });
                });
            } catch (err) {
                console.warn("Error scanning chunk", err);
            }

            processedItems += chunk.length;
            setProgress(Math.round((processedItems / totalItems) * 100));
        }

        setScanResults(results);
        setIsScanning(false);
    };

    const getSortedFilteredResults = () => {
        let finalResults = [...scanResults];

        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            finalResults = finalResults.filter(r => getItemName(r.itemName).toLowerCase().includes(term));
        }

        if (sortConfig) {
            finalResults.sort((a, b) => {
                const aValue = a[sortConfig.key] || 0;
                const bValue = b[sortConfig.key] || 0;
                if (typeof aValue === 'string') {
                    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return finalResults.slice(0, 100);
    };

    const displayedResults = getSortedFilteredResults();

    return (
        <div style={{ padding: '20px', color: 'white', height: '100%', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '24px', marginBottom: '16px' }}>Opportunity Scanner</h2>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px', fontSize: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Search</label>
                            <input
                                type="text"
                                value={filters.searchTerm}
                                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                placeholder="Search items..."
                                style={{ background: '#111', border: '1px solid #333', color: 'white', padding: '4px 8px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Min Tier</label>
                            <input
                                type="number"
                                value={filters.minTier}
                                onChange={(e) => handleFilterChange('minTier', Number(e.target.value))}
                                style={{ width: '60px', background: '#111', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Max Tier</label>
                            <input
                                type="number"
                                value={filters.maxTier}
                                onChange={(e) => handleFilterChange('maxTier', Number(e.target.value))}
                                style={{ width: '60px', background: '#111', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Min Enchant</label>
                            <input
                                type="number"
                                value={filters.minEnchant}
                                onChange={(e) => handleFilterChange('minEnchant', Number(e.target.value))}
                                style={{ width: '60px', background: '#111', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Min Profit</label>
                            <input
                                type="number"
                                value={filters.minProfit}
                                onChange={(e) => handleFilterChange('minProfit', Number(e.target.value))}
                                style={{ width: '80px', background: '#111', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Min ROI %</label>
                            <input
                                type="number"
                                value={filters.minRoi}
                                onChange={(e) => handleFilterChange('minRoi', Number(e.target.value))}
                                style={{ width: '80px', background: '#111', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ color: 'var(--text-secondary)' }}>Min Vol/Day</label>
                            <input
                                type="number"
                                value={filters.minLiquidity}
                                onChange={(e) => handleFilterChange('minLiquidity', Number(e.target.value))}
                                style={{ width: '80px', background: '#111', border: '1px solid #333', color: 'white', padding: '4px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={scanAll}
                    disabled={isScanning}
                    style={{
                        padding: '8px 16px',
                        background: isScanning ? '#333' : 'var(--accent-cyan)',
                        color: isScanning ? '#888' : '#081014',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isScanning ? 'default' : 'pointer',
                        fontWeight: 'bold',
                        marginTop: '8px'
                    }}
                >
                    {isScanning ? `Scanning... ${progress}%` : 'Scan Top Opportunities'}
                </button>
            </div>

            {displayedResults.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'right' }}>
                    <thead>
                        <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #333' }}>
                            <th style={{ textAlign: 'left', padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('itemName')}>
                                Item {getSortIndicator('itemName')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('category')}>
                                Category {getSortIndicator('category')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('tier')}>
                                Tier {getSortIndicator('tier')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('ench')}>
                                Enchant {getSortIndicator('ench')}
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
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('profit')}>
                                Profit {getSortIndicator('profit')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('profitPercentage')}>
                                ROI % {getSortIndicator('profitPercentage')}
                            </th>
                            <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('itemsPerDay')}>
                                Vol/Day {getSortIndicator('itemsPerDay')}
                            </th>
                            {settings.useFocus && (
                                <>
                                    <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('profitPerFocus')}>
                                        Silver/Focus {getSortIndicator('profitPerFocus')}
                                    </th>
                                    <th style={{ padding: '8px 4px', cursor: 'pointer' }} onClick={() => handleSort('dailyProfitAtCap')}>
                                        Daily Profit {getSortIndicator('dailyProfitAtCap')}
                                    </th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {displayedResults.map((res, i) => (
                            <tr
                                key={i}
                                style={{ borderBottom: '1px solid #222', cursor: 'pointer' }}
                                onClick={() => onSelectOpportunity(res.itemName)}
                                title="Click to view details"
                            >
                                <td style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--accent-cyan)' }}>{getItemName(res.itemName)}</td>
                                <td style={{ padding: '8px 4px' }}>{res.category}</td>
                                <td style={{ padding: '8px 4px' }}>T{res.tier}</td>
                                <td style={{ padding: '8px 4px' }}>.{res.ench}</td>
                                <td style={{ padding: '8px 4px' }}>{res.totalSaleValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td style={{ padding: '8px 4px' }}>{res.totalMaterialCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td style={{ padding: '8px 4px' }}>{res.journalProfit.toLocaleString(undefined, {maximumFractionDigits: 0})}</td>
                                <td style={{ padding: '8px 4px', color: 'var(--profit-positive)' }}>
                                    {res.profit.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                </td>
                                <td style={{ padding: '8px 4px', color: 'var(--profit-positive)' }}>
                                    {res.profitPercentage.toFixed(2)}%
                                </td>
                                <td style={{ padding: '8px 4px' }}>
                                    {res.itemsPerDay > 0 ? res.itemsPerDay.toLocaleString(undefined, {maximumFractionDigits: 1}) : 'N/A'}
                                </td>
                                {settings.useFocus && (
                                    <>
                                        <td style={{ padding: '8px 4px', color: 'var(--accent-cyan)' }}>
                                            {res.profitPerFocus ? res.profitPerFocus.toLocaleString(undefined, {maximumFractionDigits: 2}) : 0}
                                        </td>
                                        <td style={{ padding: '8px 4px', color: 'var(--profit-positive)' }}>
                                            {res.dailyProfitAtCap ? res.dailyProfitAtCap.toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {scanResults.length === 0 && !isScanning && (
                <div style={{ color: 'var(--text-secondary)', marginTop: '20px' }}>
                    Click scan to find the best crafting opportunities based on your current settings.
                </div>
            )}
        </div>
    );
};

export default OpportunityScanner;
