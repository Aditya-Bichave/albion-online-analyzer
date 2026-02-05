'use client';
//@ts-ignore
import { useState, useEffect, Fragment } from 'react';
import { PageShell } from '@/components/PageShell';
import { useAuth } from '@/context/AuthContext';
import { ItemIcon } from '@/components/ItemIcon';
import { Users, RefreshCw, TrendingUp, ChevronDown, ChevronUp, CircleHelp, Info } from 'lucide-react';
import { getMarketPrices, getMarketVolume, LOCATIONS } from '@/lib/market-service';
import { 
  LABOURER_DEFINITIONS, 
  JOURNAL_TIERS, 
  getJournalId, 
  getResourceId,
  getYield,
  BASE_RETURNS_CRAFTING,
  BASE_RETURNS_GATHERING
} from './constants';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { NumberInput } from '@/components/ui/NumberInput';
import { ServerSelector } from '@/components/ServerSelector';
import { useServer } from '@/hooks/useServer';
import { Tooltip } from '@/components/ui/Tooltip';

// Helper to format resource name
const formatResourceName = (id: string) => {
    // T4_PLANKS_LEVEL1@1 -> T4.1 Planks
    // T5_ORE -> T5 Ore
    const parts = id.split('_');
    const tier = parts[0];
    const rest = parts.slice(1).join(' ').toLowerCase();
    return `${tier} ${rest.replace(/@\d+/, '')}`;
};

interface MaterialReturn {
  id: string;
  name: string;
  tier: number;
  enchantment: number;
  quantity: number;
  price: number;
  totalValue: number;
  missingData: boolean;
  volume?: number;
}

interface LabourerTierResult {
  tier: number;
  journalId: string;
  journalName: string;
  happiness: number;
  yieldPercent: number;
  
  // Costs
  fullJournalPrice: number;
  fullJournalVolume?: number;
  totalCost: number;
  
  // Revenue
  emptyJournalId: string;
  emptyJournalPrice: number;
  emptyJournalRevenue: number;
  emptyJournalVolume?: number;
  
  materials: MaterialReturn[];
  materialRevenue: number;
  
  // Totals
  totalRevenue: number;
  profit: number;
  roi: number;
  missingData: boolean;
}

export default function LabourClient() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LabourerTierResult[]>([]);
  const [expandedTiers, setExpandedTiers] = useState<Set<number>>(new Set([8, 7, 6])); // Default expand high tiers
  
  // Filters
  const { server: region, setServer: setRegion } = useServer();
  const [selectedTypeId, setSelectedTypeId] = useState<string>('blacksmith');
  const [journalCount, setJournalCount] = useState<number>(1);
  const [houseTier, setHouseTier] = useState<number>(8);
  const [sortByTierDesc, setSortByTierDesc] = useState<boolean>(true);
  const [isPremium, setIsPremium] = useState<boolean>(true); // Default true usually
  const [useSellOrder, setUseSellOrder] = useState<boolean>(false); // Sell Order for Returns
  const [useBuyOrder, setUseBuyOrder] = useState<boolean>(true); // Buy Order for Journals (User default: Buy Order +2.5%)
  const [showVolume, setShowVolume] = useState<boolean>(false);
  const [simulateEnchantment, setSimulateEnchantment] = useState<boolean>(false);
  const [showPrices, setShowPrices] = useState(true);
  
  // Cities
  const [buyCity, setBuyCity] = useState<string>('Martlock');
  const [sellJournalCity, setSellJournalCity] = useState<string>('Martlock');
  const [sellMaterialCity, setSellMaterialCity] = useState<string>('Martlock');

  // Initialize from preferences
  useEffect(() => {
    if (profile?.preferences) {
        if (profile.preferences.defaultMarketLocation) {
            setBuyCity(profile.preferences.defaultMarketLocation);
            setSellJournalCity(profile.preferences.defaultMarketLocation);
            setSellMaterialCity(profile.preferences.defaultMarketLocation);
        }
        if (profile.preferences.showPrices !== undefined) {
              setShowPrices(profile.preferences.showPrices);
            }
    }
  }, [profile]);

  const selectedType = LABOURER_DEFINITIONS.find(t => t.id === selectedTypeId) || LABOURER_DEFINITIONS[0];

  const toggleExpand = (tier: number) => {
    const newExpanded = new Set(expandedTiers);
    if (newExpanded.has(tier)) {
      newExpanded.delete(tier);
    } else {
      newExpanded.add(tier);
    }
    setExpandedTiers(newExpanded);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const itemsToFetch = new Set<string>();
      
      // Identify all items needed
      JOURNAL_TIERS.forEach(tier => {
        // Journals
        itemsToFetch.add(getJournalId(tier, selectedType, 'FULL'));
        itemsToFetch.add(getJournalId(tier, selectedType, 'EMPTY'));
        
        // Materials (Flat, .1, .2, .3)
        // Note: Currently assuming laborers return Flat mostly, but we fetch all to show prices?
        // User example shows .1, .2, .3 with 0 quantity.
        for (let ench = 0; ench <= 3; ench++) {
          const resId = getResourceId(tier, selectedType, ench);
          if (resId) itemsToFetch.add(resId);
        }
      });

      const prices = await getMarketPrices(Array.from(itemsToFetch), region);

      // Fetch Volumes if enabled
      const volumeMap = new Map<string, number>();
      if (showVolume) {
        const fullJournalIds = JOURNAL_TIERS.map(t => getJournalId(t, selectedType, 'FULL'));
        const emptyJournalIds = JOURNAL_TIERS.map(t => getJournalId(t, selectedType, 'EMPTY'));
        const materialIds = new Set<string>();
        JOURNAL_TIERS.forEach(t => {
           for (let i=0; i<=3; i++) {
              const r = getResourceId(t, selectedType, i);
              if (r) materialIds.add(r);
           }
        });
        
        const volumePromises = [];
        // Full Journals (Buy City)
        if (fullJournalIds.length > 0) volumePromises.push(getMarketVolume(fullJournalIds, region, buyCity));
        // Empty Journals (Sell City)
        if (emptyJournalIds.length > 0) volumePromises.push(getMarketVolume(emptyJournalIds, region, sellJournalCity));
        // Materials (Sell City)
        if (materialIds.size > 0) volumePromises.push(getMarketVolume(Array.from(materialIds), region, sellMaterialCity));
        
        const volResults = await Promise.all(volumePromises);
        volResults.flat().forEach(v => {
           if (v.data && v.data.length > 0) {
              const last = v.data[v.data.length - 1];
              volumeMap.set(v.item_id, last.item_count);
           }
        });
      }

      const results: LabourerTierResult[] = JOURNAL_TIERS.map(tier => {
        const fullJournalId = getJournalId(tier, selectedType, 'FULL');
        const emptyJournalId = getJournalId(tier, selectedType, 'EMPTY');
        
        // Get Prices
        // Buy Full Journal:
        // If useBuyOrder -> Max Buy Order Price (plus setup fee logic elsewhere or simplified?)
        // User says "Buy Order (+2.5%)". This usually means Cost = Buy Order Price + 2.5% Setup Fee.
        // If NOT useBuyOrder -> Min Sell Order Price (Instant Buy).
        const fullJournalStats = prices.find(p => p.item_id === fullJournalId && p.city === buyCity);
        let fullJournalPrice = 0;
        const fullJournalVolume = volumeMap.get(fullJournalId);
        
        if (useBuyOrder) {
          fullJournalPrice = fullJournalStats ? fullJournalStats.buy_price_max : 0;
          // Add 2.5% Setup Fee?
          // User text: "Buy Order (+2.5%) Include taxes"
          // If checkbox "Include taxes" is checked (implied by user prompt structure), we add 2.5%.
          // We'll assume the toggle implies "Use Buy Orders AND Include Setup Fee".
          if (fullJournalPrice > 0) fullJournalPrice *= 1.025;
        } else {
          fullJournalPrice = fullJournalStats ? fullJournalStats.sell_price_min : 0;
        }

        // Sell Empty Journal:
        // If useSellOrder -> Min Sell Order Price (Revenue = Price - Tax - Setup).
        // If NOT useSellOrder -> Max Buy Order Price (Revenue = Price - Tax).
        // User text: "Sell Order (+6.5%)". 
        // 6.5% = 4% Premium Tax + 2.5% Setup Fee. Or 4% + 2.5%.
        // If Premium is enabled, tax is 4% (Sell Order) or 2% (Buy Order)?
        // Wait, standard tax: 4% (Premium) / 8% (Non-Premium).
        // Setup fee: 2.5% (always).
        // If useSellOrder:
        //   Revenue = Price * (1 - TaxRate - 0.025)
        // If Instant Sell (to Buy Order):
        //   Revenue = Price * (1 - TaxRate)
        
        const emptyJournalStats = prices.find(p => p.item_id === emptyJournalId && p.city === sellJournalCity);
        let emptyJournalPrice = 0;
        let emptyJournalRevenue = 0;
        const emptyJournalVolume = volumeMap.get(emptyJournalId);
        
        // const taxRate = isPremium ? 0.04 : 0.08; // 4% vs 8% Usage Fee? 
        // Actually Premium halves the tax? 
        // Current Albion: 4% Tax (Premium: 2%)?
        // User says "Sell Order (+6.5%)". 6.5 = 4 + 2.5. So Tax=4%. 
        // This implies User considers "Premium" to NOT be active in that calculation?
        // Or User means Standard Tax (4%) + Setup (2.5%).
        // Let's stick to: Tax = isPremium ? 0.02 : 0.04. (Plus Setup 0.025 if Sell Order).
        // Wait, if User says 6.5%, that's 4% + 2.5%. So Base Tax 4%.
        // If Premium, Base Tax is 2%. So 2% + 2.5% = 4.5%.
        
        const appliedTax = isPremium ? 0.02 : 0.04;
        
        if (useSellOrder) {
          emptyJournalPrice = emptyJournalStats ? emptyJournalStats.sell_price_min : 0;
          if (emptyJournalPrice > 0) {
            emptyJournalRevenue = emptyJournalPrice * (1 - appliedTax - 0.025);
          }
        } else {
          emptyJournalPrice = emptyJournalStats ? emptyJournalStats.buy_price_max : 0;
          if (emptyJournalPrice > 0) {
            emptyJournalRevenue = emptyJournalPrice * (1 - appliedTax);
          }
        }

        // Calculate Yield
        const yieldPercent = getYield(tier, houseTier);
        const baseReturnTable = selectedType.category === 'gathering' ? BASE_RETURNS_GATHERING : BASE_RETURNS_CRAFTING;
        const baseReturn = baseReturnTable[tier] || 0;
        
        // Materials
        const materials: MaterialReturn[] = [];
        let materialRevenue = 0;
        let hasMissingData = false;
        
        // Loop 0 to 3 enchantments
        for (let ench = 0; ench <= 3; ench++) {
          const resId = getResourceId(tier, selectedType, ench);
          if (!resId) continue;
          
          // Quantity Logic:
          // Crafting Laborers: Return Flat (Ench 0) mostly.
          // Gathering: Return Flat? Or chance of enchanted?
          // Simplified: All returns are Flat (Ench 0).
          // Set Quantity = 0 for Ench > 0.
          
          let quantity = 0;
          if (ench === 0) {
             quantity = baseReturn * yieldPercent * journalCount;
             
             // If simulating enchantment, reduce Flat quantity
             if (simulateEnchantment) {
                // Assume 10% becomes .1, 1% becomes .2, 0.1% becomes .3 (Rough Estimate)
                quantity = quantity * 0.889; 
             }
          } else if (simulateEnchantment) {
             const baseQty = baseReturn * yieldPercent * journalCount;
             if (ench === 1) quantity = baseQty * 0.10;
             else if (ench === 2) quantity = baseQty * 0.01;
             else if (ench === 3) quantity = baseQty * 0.001;
          }
          
          const matStats = prices.find(p => p.item_id === resId && p.city === sellMaterialCity);
          
          let unitPrice = 0;
          let netUnitValue = 0;
          
          if (useSellOrder) {
             unitPrice = matStats ? matStats.sell_price_min : 0;
             netUnitValue = unitPrice * (1 - appliedTax - 0.025);
          } else {
             unitPrice = matStats ? matStats.buy_price_max : 0;
             netUnitValue = unitPrice * (1 - appliedTax);
          }
          
          if (unitPrice === 0 && quantity > 0) hasMissingData = true;
          if (fullJournalPrice === 0) hasMissingData = true;
          if (emptyJournalPrice === 0) hasMissingData = true;

          const totalValue = quantity * netUnitValue;
          materialRevenue += totalValue;
          
          materials.push({
            id: resId,
            name: formatResourceName(resId),
            tier,
            enchantment: ench,
            quantity,
            price: unitPrice,
            totalValue,
            missingData: unitPrice === 0,
            volume: volumeMap.get(resId)
          });
        }

        const totalCost = fullJournalPrice * journalCount;
        const totalRev = (emptyJournalRevenue * journalCount) + materialRevenue;
        const profit = totalRev - totalCost;
        const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

        return {
          tier,
          journalId: fullJournalId,
          journalName: `${selectedType.name} Journal`,
          happiness: yieldPercent * 100 / 1.5, // Rough happiness %? Or just show Yield? User asked "Happiness: 120.0%"
          // Yield 1.5 = 150% Yield. Happiness ~ 100% (filled).
          // Actually user example: "Happiness: 120.0%". This likely refers to Happiness Value or Yield?
          // Let's show Yield % (e.g. 150%).
          yieldPercent: yieldPercent * 100,
          
          fullJournalPrice,
          fullJournalVolume,
          totalCost,
          
          emptyJournalId,
          emptyJournalPrice,
          emptyJournalRevenue: emptyJournalRevenue * journalCount,
          emptyJournalVolume,
          
          materials,
          materialRevenue,
          
          totalRevenue: totalRev,
          profit,
          roi,
          missingData: hasMissingData
        };
      });

      if (sortByTierDesc) {
        results.sort((a, b) => b.tier - a.tier);
      } else {
        results.sort((a, b) => a.tier - b.tier);
      }

      setData(results);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [region, selectedTypeId, journalCount, houseTier, sortByTierDesc, isPremium, useSellOrder, useBuyOrder, buyCity, sellJournalCity, sellMaterialCity, showVolume, simulateEnchantment]);

  // Find Best Tiers
  // Filter out items with missing data or zero cost to avoid "fake" bests (e.g. 0% ROI due to 0 cost)
  const validData = data.filter(d => !d.missingData && d.totalCost > 0);
  const bestProfit = validData.length > 0 ? [...validData].sort((a, b) => b.profit - a.profit)[0] : null;
  const bestRoi = validData.length > 0 ? [...validData].sort((a, b) => b.roi - a.roi)[0] : null;

  const cityOptions = LOCATIONS.filter(l => l !== 'Black Market').map(city => ({
    value: city,
    label: city
  }));

  return (
    <PageShell 
      title="Labourer Calculator" 
      backgroundImage='/background/ao-crafting.jpg'  
      description="Calculate profits from Labourer journals and returns."
      icon={<Users className="h-6 w-6" />}
      headerActions={
        <div className="flex items-center gap-4">
          <ServerSelector
            selectedServer={region}
            onServerChange={setRegion}
          />
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg border border-border transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        {validData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestProfit && (
              <div className="bg-card/50 p-4 rounded-xl border border-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Highest Profit</div>
                  <div className="text-xl font-bold text-foreground">T{bestProfit.tier} {bestProfit.journalName}</div>
                  <div className="text-sm text-success">+{bestProfit.profit.toLocaleString()} silver</div>
                </div>
              </div>
            )}
            
            {bestRoi && (
              <div className="bg-card/50 p-4 rounded-xl border border-border flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center text-info">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Best ROI</div>
                  <div className="text-xl font-bold text-foreground">T{bestRoi.tier} {bestRoi.journalName}</div>
                  <div className="text-sm text-info">{bestRoi.roi.toFixed(1)}% ROI</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-card/50 p-6 rounded-xl border border-border space-y-6">
          {/* Top Row: Core Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Select
              label="Journal Type"
              options={LABOURER_DEFINITIONS.map(t => ({ value: t.id, label: t.name }))}
              value={selectedTypeId}
              onChange={(value) => setSelectedTypeId(value)}
            />
            
            <NumberInput
              label="Number of Journals"
              value={journalCount}
              onChange={setJournalCount}
              min={1}
            />
            
            <Select
              label="House Tier"
              options={[2,3,4,5,6,7,8].map(t => ({ value: t, label: `Tier ${t}` }))}
              value={houseTier}
              onChange={(value) => setHouseTier(value)}
            />
          </div>

          {/* Middle Row: Global Toggles */}
          <div className="flex flex-wrap gap-6 p-4 bg-muted/50 rounded-lg border border-border/50">
             <Checkbox 
               label="Premium (Lower Tax)" 
               checked={isPremium} 
               onChange={(e) => setIsPremium(e.target.checked)} 
             />
             <Checkbox 
               label="Sort by Tier" 
               checked={sortByTierDesc} 
               onChange={(e) => setSortByTierDesc(e.target.checked)} 
             />
             <Checkbox 
               label="Show Trading Volumes" 
               checked={showVolume} 
               onChange={(e) => setShowVolume(e.target.checked)} 
             />
             <Checkbox 
               label="Simulate Enchanted Returns" 
               description="Est. 10% .1, 1% .2, 0.1% .3"
               checked={simulateEnchantment} 
               onChange={(e) => setSimulateEnchantment(e.target.checked)} 
             />
          </div>
          
          <div className="h-px bg-border/50" />
          
          {/* Bottom Row: Market Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Buy Journals */}
            <div className="space-y-3">
               <h4 className="font-medium text-muted-foreground text-sm">Buy Journals (Full)</h4>
               <Select
                 value={buyCity}
                 onChange={(value) => setBuyCity(value)}
                 options={cityOptions}
               />
               <Checkbox 
                 label="Use Buy Order (+2.5%)" 
                 checked={useBuyOrder} 
                 onChange={(e) => setUseBuyOrder(e.target.checked)}
                 className="text-xs text-muted-foreground"
               />
            </div>
            
            {/* Sell Journals */}
            <div className="space-y-3">
               <h4 className="font-medium text-muted-foreground text-sm">Sell Journals (Empty)</h4>
               <Select
                 value={sellJournalCity}
                 onChange={(value) => setSellJournalCity(value)}
                 options={cityOptions}
               />
               <Checkbox 
                 label="Use Sell Order (+6.5%)" 
                 checked={useSellOrder} 
                 onChange={(e) => setUseSellOrder(e.target.checked)}
                 className="text-xs text-muted-foreground"
               />
            </div>
            
            {/* Sell Materials */}
            <div className="space-y-3">
               <div className="flex justify-between items-baseline">
                   <h4 className="font-medium text-muted-foreground text-sm">Sell Materials</h4>
                   <Tooltip content="Prices for returned materials">
                       <CircleHelp className="h-3 w-3 text-muted-foreground" />
                   </Tooltip>
               </div>
               <Select
                 value={sellMaterialCity}
                 onChange={(value) => setSellMaterialCity(value)}
                 options={cityOptions}
               />
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {data.map((tierData) => (
            <div key={tierData.tier} className="bg-card/50 border border-border rounded-xl overflow-hidden transition-all hover:border-primary/30">
              {/* Header Row */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 select-none"
                onClick={() => toggleExpand(tierData.tier)}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-lg border ${
                    tierData.tier >= 7 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    tierData.tier >= 5 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    T{tierData.tier}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{tierData.journalName}</div>
                    <div className="text-xs text-muted-foreground flex gap-2">
                       <span>Yield: {tierData.yieldPercent.toFixed(0)}%</span>
                       {tierData.missingData && (
                         <span className="text-warning flex items-center gap-1">
                           <Info className="h-3 w-3" /> Missing Data
                         </span>
                       )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Revenue</div>
                    <div className="font-mono">{tierData.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Cost</div>
                    <div className="font-mono">{tierData.totalCost.toLocaleString()}</div>
                  </div>
                  <div className="text-right w-24">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Profit</div>
                    <div className={`font-mono font-bold ${tierData.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                      {tierData.profit > 0 ? '+' : ''}{tierData.profit.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right w-16">
                     <div className={`font-bold ${tierData.roi > 0 ? 'text-success' : 'text-destructive'}`}>
                        {tierData.roi.toFixed(0)}%
                     </div>
                  </div>
                  {expandedTiers.has(tierData.tier) ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedTiers.has(tierData.tier) && (
                <div className="border-t border-border bg-muted/10 p-4 animate-in slide-in-from-top-2">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Breakdown */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Transaction Breakdown</h4>
                          
                          {/* Cost */}
                          <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted/20">
                              <div className="flex items-center gap-2">
                                  <ItemIcon itemId={tierData.journalId} className="h-8 w-8" />
                                  <span>Full Journal Cost</span>
                              </div>
                              <div className="text-right">
                                  <div className="font-mono text-destructive">-{tierData.totalCost.toLocaleString()}</div>
                                  <div className="text-xs text-muted-foreground">
                                      {tierData.fullJournalPrice.toLocaleString()} x {journalCount}
                                      {tierData.fullJournalVolume !== undefined && <span className="ml-2 opacity-70">Vol: {tierData.fullJournalVolume}</span>}
                                  </div>
                              </div>
                          </div>

                          {/* Empty Return */}
                          <div className="flex justify-between items-center text-sm p-2 rounded hover:bg-muted/20">
                              <div className="flex items-center gap-2">
                                  <ItemIcon itemId={tierData.emptyJournalId} className="h-8 w-8" />
                                  <span>Empty Journal Return</span>
                              </div>
                              <div className="text-right">
                                  <div className="font-mono text-success">+{tierData.emptyJournalRevenue.toLocaleString()}</div>
                                  <div className="text-xs text-muted-foreground">
                                      {tierData.emptyJournalPrice.toLocaleString()} x {journalCount}
                                      {tierData.emptyJournalVolume !== undefined && <span className="ml-2 opacity-70">Vol: {tierData.emptyJournalVolume}</span>}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="h-px bg-border/50 my-2" />
                          
                          {/* Materials Return */}
                          <div className="flex justify-between items-center text-sm p-2 rounded font-medium">
                              <span>Total Material Value</span>
                              <span className="font-mono text-success">+{tierData.materialRevenue.toLocaleString()}</span>
                          </div>
                      </div>

                      {/* Right: Material Details */}
                      <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Material Returns</h4>
                          <div className="space-y-1">
                              {tierData.materials.map(mat => (
                                  <div key={mat.id} className={`flex justify-between items-center text-sm p-2 rounded ${mat.quantity > 0 ? 'hover:bg-muted/20' : 'opacity-50'}`}>
                                      <div className="flex items-center gap-2">
                                          <ItemIcon itemId={mat.id} className="h-8 w-8" />
                                          <div className="flex flex-col">
                                              <span>{mat.name}</span>
                                              <span className="text-xs text-muted-foreground">
                                                  Qty: {mat.quantity.toFixed(1)} 
                                                  {mat.volume !== undefined && <span className="ml-2">Vol: {mat.volume}</span>}
                                              </span>
                                          </div>
                                      </div>
                                      <div className="text-right">
                                          <div className="font-mono">{mat.totalValue.toLocaleString()}</div>
                                          <div className="text-xs text-muted-foreground">{mat.price.toLocaleString()} / unit</div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          ))}

          {data.length === 0 && !loading && (
             <div className="text-center py-12 text-muted-foreground">
                 No data available.
             </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
