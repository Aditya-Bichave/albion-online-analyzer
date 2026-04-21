import { RECIPES } from './recipeData';
import { calculateLiquidityMetrics } from './liquidityUtils';
import { calculateFocusMetrics } from './focusUtils';

const FOCUS_RETURN_RATE = 0.435; // Example 43.5% return with focus
const BASE_RETURN_RATE = 0.152; // Example 15.2% base return
const JOURNAL_FAME_PER_VALUE = 3; // Approx fame
const FOCUS_PER_NUTRITION = 1.0; // Assume 1 focus point per nutrition point for simplicity unless detailed recipe focus is available

export const calculateProfit = (itemName, tier, enchantLevel, settings, prices, history) => {
  const recipe = RECIPES[itemName];
  if (!recipe) return { profit: 0, profitPercentage: 0, totalSaleValue: 0, totalMaterialCost: 0, journalProfit: 0, itemsPerDay: 0 };

  const isFocus = settings.useFocus;
  const isJournal = settings.useJournals;
  const numSold = parseInt(settings.numberSold) || 1;
  const feeNutrition = parseInt(settings.feeNutrition) || 500;

  const returnRate = isFocus ? FOCUS_RETURN_RATE : BASE_RETURN_RATE;

  const enchantSuffix = enchantLevel > 0 ? `@${enchantLevel}` : '';
  const itemId = `T${tier}_${recipe.itemSuffix}${enchantSuffix}`;

  // Market price
  const priceData = prices[itemId] || {};
  const sellPrice = settings.useAveragePrice ? (priceData.average_price || 0) : (priceData.sell_price_min || 0);

  // Material Cost
  let totalMaterialCost = 0;
  Object.entries(recipe.ingredients).forEach(([mat, qty]) => {
    // Check if material is an artifact or special item that might not follow the exact tier/enchant pattern for everything
    let matId = `T${tier}_${mat}${enchantSuffix}`;

    // For specific items like faction tokens or untiered base items:
    if (mat.startsWith('T1_FACTION_')) {
        matId = mat; // T1_FACTION_ tokens are exactly named
    } else if (mat === 'CAPE') {
        matId = `T${tier}_CAPE${enchantSuffix}`; // T4_CAPE, T5_CAPE, etc.
    } else if (mat.endsWith('_BP')) {
        matId = `T${tier}_${mat}`; // Blueprint items
    }

    let matPrice = 0;
    // Check for exact quality/enchant in the API response or use default prices
    const matPriceData = prices[matId];
    if (matPriceData) {
       matPrice = settings.useAveragePrice ? (matPriceData.average_price || 0) : (matPriceData.sell_price_min || 0);
    }

    totalMaterialCost += matPrice * qty;
  });

  // Effective material cost after return rate
  const effectiveCost = totalMaterialCost * (1 - returnRate);

  // Nutrition cost
  const totalNutrition = recipe.nutrition || 0;
  const nutritionCost = (totalNutrition / 100) * feeNutrition;

  // Journal calculation
  let journalProfit = 0;
  if (isJournal && recipe.journal) {
      const emptyJournalId = `T${tier}_JOURNAL_${recipe.journal}_EMPTY`;
      const fullJournalId = `T${tier}_JOURNAL_${recipe.journal}_FULL`;

      const emptyPrice = prices[emptyJournalId]?.sell_price_min || 0;
      const fullPrice = prices[fullJournalId]?.sell_price_min || 0;

      const itemFame = (recipe.itemValue || 100) * JOURNAL_FAME_PER_VALUE;
      journalProfit = ((fullPrice - emptyPrice) * (itemFame / 3000));
  }

  // Final Profit for 1 item
  const estimatedProfit = sellPrice - effectiveCost - nutritionCost + journalProfit;

  // Total profit for number sold
  const totalEstimatedProfit = estimatedProfit * numSold;

  // Percentage
  const costBasis = effectiveCost + nutritionCost;
  const profitPercentage = costBasis > 0 ? (estimatedProfit / costBasis) * 100 : 0;

  // History and liquidity
  const historyData = history ? history[itemId] : null;
  const liquidityMetrics = calculateLiquidityMetrics(priceData, historyData);

  // Focus metrics
  // Base focus needed per craft roughly scales with nutrition. Let's use a mock mapping based on nutrition.
  const focusNeeded = totalNutrition * FOCUS_PER_NUTRITION * numSold;

  const baseResult = {
    profit: totalEstimatedProfit,
    profitPercentage: profitPercentage,
    totalSaleValue: sellPrice * numSold,
    totalMaterialCost: totalMaterialCost * numSold,
    journalProfit: journalProfit * numSold,
    ...liquidityMetrics
  };

  const focusMetrics = calculateFocusMetrics(baseResult, focusNeeded);

  return {
    ...baseResult,
    ...focusMetrics
  };
};
