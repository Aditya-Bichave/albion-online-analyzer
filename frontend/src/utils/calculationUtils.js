import { RECIPES } from './recipeData';

const FOCUS_RETURN_RATE = 0.435; // Example 43.5% return with focus
const BASE_RETURN_RATE = 0.152; // Example 15.2% base return
const JOURNAL_FAME_PER_VALUE = 3; // Approx fame

export const calculateProfit = (itemName, tier, enchantLevel, settings, prices) => {
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
    // Assuming materials follow a T{tier}_{mat} pattern. If the material string already contains a 'T', we might not prefix it.
    // Simplifying:
    const matId = `T${tier}_${mat}${enchantSuffix}`;
    const matPriceData = prices[matId] || {};
    const matPrice = settings.useAveragePrice ? (matPriceData.average_price || 0) : (matPriceData.sell_price_min || 0);
    // Usually recipes scale per tier, we'll keep the qty static for now or apply tier multiplier if needed.
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

  // Items per day logic (mock for now, could be related to focus limits or market volume)
  const itemsPerDay = 100;

  return {
    profit: totalEstimatedProfit,
    profitPercentage: profitPercentage,
    totalSaleValue: sellPrice * numSold,
    totalMaterialCost: totalMaterialCost * numSold,
    journalProfit: journalProfit * numSold,
    itemsPerDay: itemsPerDay
  };
};