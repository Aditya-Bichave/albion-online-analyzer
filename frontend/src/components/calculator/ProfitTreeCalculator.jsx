import React, { useState, useEffect } from 'react';
import SettingsPanel from './SettingsPanel';
import CraftBranchTree from './CraftBranchTree';
import ProfitTable from './ProfitTable';
import { RECIPES, CITIES } from '../../utils/recipeData';

const AODP_API_BASE = 'https://www.albion-online-data.com/api/v2/stats/prices/';

const ProfitTreeCalculator = () => {
    // Settings State
    const [settings, setSettings] = useState({
        useJournals: true,
        useFocus: false,
        useMultipleCities: false,
        numberSold: 1,
        useAveragePrice: false,
        feeNutrition: 500,
        mainCity: 'Caerleon'
    });

    // Selection State
    const [selectedItem, setSelectedItem] = useState('Broadsword');

    // Data State
    const [prices, setPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Initial load and when selected item/city changes
    useEffect(() => {
        if (selectedItem) {
            updateCurrentItem();
        }
    }, [selectedItem, settings.mainCity]);

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
                for (let i = 1; i <= 4; i++) {
                    allItems.push(`${item}@${i}`);
                }
            });

            const itemsQuery = allItems.join(',');
            const locationsQuery = settings.useMultipleCities ? '' : `?locations=${settings.mainCity}`;
            const url = `${AODP_API_BASE}${itemsQuery}${locationsQuery}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch prices');

            const data = await response.json();

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

            setPrices(newPrices);
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
                itemsToFetch.push(`T${tier}_${mat}`);
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
                itemsToFetch.push(`T${tier}_${mat}`);
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
            <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-active)', overflowY: 'auto' }}>
                <SettingsPanel
                    settings={settings}
                    onSettingChange={handleSettingChange}
                    onUpdateCurrent={updateCurrentItem}
                    onUpdateResources={updateResourcePrices}
                    onUpdateJournals={updateJournalPrices}
                    isLoading={isLoading}
                />
            </div>

            <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-active)', overflowY: 'auto' }}>
                <CraftBranchTree
                    selectedItem={selectedItem}
                    onSelectItem={setSelectedItem}
                />
            </div>

            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                <ProfitTable
                    selectedItem={selectedItem}
                    settings={settings}
                    prices={prices}
                    isLoading={isLoading}
                />
            </div>
        </div>
    );
};

export default ProfitTreeCalculator;