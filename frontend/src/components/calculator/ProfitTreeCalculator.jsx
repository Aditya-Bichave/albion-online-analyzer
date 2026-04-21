import React, { useState, useEffect } from 'react';
import SettingsPanel from './SettingsPanel';
import CraftBranchTree from './CraftBranchTree';
import ProfitTable from './ProfitTable';
import OpportunityScanner from './OpportunityScanner';
import { RECIPES, CITIES } from '../../utils/recipeData';

import { SERVERS } from '../../utils/constants';


const ProfitTreeCalculator = () => {
    // Settings State
    const [settings, setSettings] = useState({
        useJournals: true,
        useFocus: false,
        useMultipleCities: false,
        numberSold: 1,
        useAveragePrice: false,
        server: 'west',
        feeNutrition: 500,
        mainCity: 'Caerleon'
    });

    // Selection State
    const [selectedItem, setSelectedItem] = useState('Broadsword');
    const [activeView, setActiveView] = useState('selected'); // 'selected' | 'scanner'

    // Data State
    const [prices, setPrices] = useState({});
    const [history, setHistory] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Extract updateCurrentItem to avoid dependency warning or hoist it
    // Moving it into a useCallback or simply fetching directly here:
    // Initial load and when selected item/city changes
    useEffect(() => {
        const itemRecipe = RECIPES[selectedItem];
        if (!itemRecipe) return;

        const itemsToFetch = [];
        itemRecipe.tiers.forEach(tier => {
            itemsToFetch.push(`T${tier}_${itemRecipe.itemSuffix}`);
            Object.keys(itemRecipe.ingredients).forEach(mat => {
                if (mat.startsWith('T1_FACTION_')) {
                    itemsToFetch.push(mat);
                } else if (mat === 'CAPE') {
                    itemsToFetch.push(`T${tier}_CAPE`);
                } else if (mat.endsWith('_BP')) {
                    itemsToFetch.push(`T${tier}_${mat}`);
                } else {
                    itemsToFetch.push(`T${tier}_${mat}`);
                }
            });
            if (settings.useJournals && itemRecipe.journal) {
                itemsToFetch.push(`T${tier}_JOURNAL_${itemRecipe.journal}_EMPTY`, `T${tier}_JOURNAL_${itemRecipe.journal}_FULL`);
            }
        });

        const fetchPricesInline = async (items) => {
            setIsLoading(true);
            try {
                const allItems = [];
                items.forEach(item => {
                    allItems.push(item);
                    // Faction tokens and blueprints do not have enchantments
                    if (!item.startsWith('T1_FACTION_') && !item.endsWith('_BP')) {
                        for (let i = 1; i <= 4; i++) {
                            allItems.push(`${item}@${i}`);
                        }
                    }
                });

                const itemsQuery = allItems.join(',');
                const locationsQuery = settings.useMultipleCities ? '' : `?locations=${settings.mainCity}`;
                const serverConfig = SERVERS.find(s => s.id === settings.server) || SERVERS[0];

                const url = `${serverConfig.url}prices/${itemsQuery}${locationsQuery}`;
                const historyUrl = `${serverConfig.url}history/${itemsQuery}?locations=${settings.mainCity}&time-scale=24&qualities=1`;

                const [priceRes, historyRes] = await Promise.all([
                    fetch(url).catch(() => null),
                    fetch(historyUrl).catch(() => null)
                ]);

                let data = [];
                let historyData = [];
                if (priceRes && priceRes.ok) data = await priceRes.json();
                if (historyRes && historyRes.ok) historyData = await historyRes.json();

                // Note: We need a functional state update here to not depend on `prices` in the effect
                setPrices(prevPrices => {
                    const newPrices = { ...prevPrices };
                    data.forEach(entry => {
                        if (settings.useMultipleCities) {
                            if (!newPrices[entry.item_id] ||
                                (entry.sell_price_min > 0 &&
                                 (newPrices[entry.item_id].sell_price_min === 0 || entry.sell_price_min < newPrices[entry.item_id].sell_price_min))) {
                                newPrices[entry.item_id] = entry;
                            }
                        } else if (entry.city === settings.mainCity) {
                            newPrices[entry.item_id] = entry;
                        }
                    });
                    return newPrices;
                });

                setHistory(prevHistory => {
                    const newHistory = { ...prevHistory };
                    if (Array.isArray(historyData)) {
                        historyData.forEach(entry => {
                           if (entry.location === settings.mainCity && entry.data) {
                               newHistory[entry.item_id] = entry.data;
                           }
                        });
                    }
                    return newHistory;
                });
            } catch (error) {
                console.error('Error fetching prices:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedItem) {
            fetchPricesInline(itemsToFetch);
        }
    }, [selectedItem, settings.mainCity, settings.useMultipleCities, settings.useJournals, settings.server]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const fetchPrices = async (items) => {
        setIsLoading(true);
        try {
            // Include enchantments 0-4
            const allItems = [];
            items.forEach(item => {
                allItems.push(item);
                // Faction tokens and blueprints do not have enchantments
                if (!item.startsWith('T1_FACTION_') && !item.endsWith('_BP')) {
                    for (let i = 1; i <= 4; i++) {
                        allItems.push(`${item}@${i}`);
                    }
                }
            });

            const itemsQuery = allItems.join(',');
            const locationsQuery = settings.useMultipleCities ? '' : `?locations=${settings.mainCity}`;
            const serverConfig = SERVERS.find(s => s.id === settings.server) || SERVERS[0];
            const url = `${serverConfig.url}prices/${itemsQuery}${locationsQuery}`;
            const historyUrl = `${serverConfig.url}history/${itemsQuery}?locations=${settings.mainCity}&time-scale=24&qualities=1`;

            const [priceRes, historyRes] = await Promise.all([
                fetch(url).catch(() => null),
                fetch(historyUrl).catch(() => null)
            ]);

            let data = [];
            let historyData = [];
            if (priceRes && priceRes.ok) data = await priceRes.json();
            if (historyRes && historyRes.ok) historyData = await historyRes.json();

            const newPrices = { ...prices };
            data.forEach(entry => {
                if (settings.useMultipleCities) {
                    // Keep the lowest valid price across all cities
                    if (!newPrices[entry.item_id] ||
                        (entry.sell_price_min > 0 &&
                         (newPrices[entry.item_id].sell_price_min === 0 || entry.sell_price_min < newPrices[entry.item_id].sell_price_min))) {
                        newPrices[entry.item_id] = entry;
                    }
                } else if (entry.city === settings.mainCity) {
                    newPrices[entry.item_id] = entry;
                }
            });

            const newHistory = { ...history };
            if (Array.isArray(historyData)) {
                historyData.forEach(entry => {
                    if (entry.location === settings.mainCity && entry.data) {
                        newHistory[entry.item_id] = entry.data;
                    }
                });
            }

            setPrices(newPrices);
            setHistory(newHistory);
        } catch (error) {
            console.error('Error fetching prices:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getItemsToFetch = (itemName, recipe) => {
        const itemsToFetch = [];
        if (!recipe) return itemsToFetch;

        recipe.tiers.forEach(tier => {
            itemsToFetch.push(`T${tier}_${recipe.itemSuffix}`);

            Object.keys(recipe.ingredients).forEach(mat => {
                if (mat.startsWith('T1_FACTION_')) {
                    itemsToFetch.push(mat);
                } else if (mat === 'CAPE') {
                    itemsToFetch.push(`T${tier}_CAPE`);
                } else if (mat.endsWith('_BP')) {
                    itemsToFetch.push(`T${tier}_${mat}`);
                } else {
                    itemsToFetch.push(`T${tier}_${mat}`);
                }
            });

            if (settings.useJournals && recipe.journal) {
                itemsToFetch.push(`T${tier}_JOURNAL_${recipe.journal}_EMPTY`, `T${tier}_JOURNAL_${recipe.journal}_FULL`);
            }
        });

        return itemsToFetch;
    };

    const updateCurrentItem = () => {
        const itemRecipe = RECIPES[selectedItem];
        if (!itemRecipe) return;

        const itemsToFetch = getItemsToFetch(selectedItem, itemRecipe);
        fetchPrices(itemsToFetch);
    };

    const updateResourcePrices = () => {
        const itemRecipe = RECIPES[selectedItem];
        if (!itemRecipe) return;

        const itemsToFetch = [];
        itemRecipe.tiers.forEach(tier => {
            Object.keys(itemRecipe.ingredients).forEach(mat => {
                if (mat.startsWith('T1_FACTION_')) {
                    itemsToFetch.push(mat);
                } else if (mat === 'CAPE') {
                    itemsToFetch.push(`T${tier}_CAPE`);
                } else if (mat.endsWith('_BP')) {
                    itemsToFetch.push(`T${tier}_${mat}`);
                } else {
                    itemsToFetch.push(`T${tier}_${mat}`);
                }
            });
        });
        fetchPrices(itemsToFetch);
    };

    const updateJournalPrices = () => {
        const itemRecipe = RECIPES[selectedItem];
        if (!itemRecipe || !itemRecipe.journal) return;

        const itemsToFetch = [];
        itemRecipe.tiers.forEach(tier => {
            itemsToFetch.push(`T${tier}_JOURNAL_${itemRecipe.journal}_EMPTY`, `T${tier}_JOURNAL_${itemRecipe.journal}_FULL`);
        });
        fetchPrices(itemsToFetch);
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: '#090a0d', color: 'white' }}>
            <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-active)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '20px 20px 0', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setActiveView('selected')}
                        style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                            background: activeView === 'selected' ? 'rgba(34, 211, 238, 0.18)' : 'transparent',
                            color: activeView === 'selected' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        Selected Item
                    </button>
                    <button
                        onClick={() => setActiveView('scanner')}
                        style={{
                            flex: 1, padding: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                            background: activeView === 'scanner' ? 'rgba(34, 211, 238, 0.18)' : 'transparent',
                            color: activeView === 'scanner' ? 'white' : 'var(--text-secondary)'
                        }}
                    >
                        Scanner
                    </button>
                </div>
                <SettingsPanel
                    settings={settings}
                    onSettingChange={handleSettingChange}
                    onUpdateCurrent={updateCurrentItem}
                    onUpdateResources={updateResourcePrices}
                    onUpdateJournals={updateJournalPrices}
                    isLoading={isLoading}
                />
            </div>

            <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-active)', overflowY: 'auto', opacity: activeView === 'scanner' ? 0.5 : 1, pointerEvents: activeView === 'scanner' ? 'none' : 'auto' }}>
                <CraftBranchTree
                    selectedItem={selectedItem}
                    onSelectItem={setSelectedItem}
                />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeView === 'selected' ? (
                    <ProfitTable
                        selectedItem={selectedItem}
                        settings={settings}
                        prices={prices}
                        history={history}
                        isLoading={isLoading}
                    />
                ) : (
                    <OpportunityScanner
                        settings={settings}
                        onSelectOpportunity={(itemName) => {
                            setSelectedItem(itemName);
                            setActiveView('selected');
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default ProfitTreeCalculator;