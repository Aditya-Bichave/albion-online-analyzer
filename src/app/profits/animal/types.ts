// Type exports for components
export interface Animal {
  id: string;
  name: string;
  tier: number;
  babyId: string;
  adultId: string;
  growthTime: number;
  foodConsumption: number;
  offspringRate: number;
  offspringRateFocus: number;
  produceId?: string;
  produceYield?: number;
  meatId?: string;
  meatYield?: number;
  favoriteFoodId?: string;
}

export interface AnimalData extends Animal {
  // Breeding
  babyPrice: number;
  babyVolume: number;
  adultPrice: number;
  adultVolume: number;

  // Food
  foodPrice: number;
  foodVolume: number;
  favoriteFoodPrice: number;
  favoriteFoodVolume: number;

  // Products
  productPrice: number;
  productVolume: number;

  // Butchering
  meatPrice: number;
  meatVolume: number;

  // Calculations
  cost: number;
  profit: number;
  profitPerPlot: number;
  roi: number;
  totalProfit: number;

  warning?: string;

  // User override flags
  isCustomBabyPrice?: boolean;
  isCustomAdultPrice?: boolean;
  isCustomFoodPrice?: boolean;
  isCustomFavoriteFoodPrice?: boolean;
  isCustomProductPrice?: boolean;
  isCustomMeatPrice?: boolean;

  // Original fetched prices
  originalBabyPrice?: number;
  originalAdultPrice?: number;
  originalFoodPrice?: number;
  originalFavoriteFoodPrice?: number;
  originalProductPrice?: number;
  originalMeatPrice?: number;
}
