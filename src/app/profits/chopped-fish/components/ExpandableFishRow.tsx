'use client';

import { ChevronDown, ChevronUp, AlertCircle, TrendingUp, Coins, Package, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

interface FishData {
  id: string;
  tier: number;
  isRare?: boolean;
  choppedYield: number;
  fishPrice: number;
  fishVolume: number;
  choppedFishPrice: number;
  fishCost: number;
  fishRequired: number;
  revenueTotal: number;
  pricePerChopped: number;
  profit: number;
  roi: number;
  missingData: boolean;
}

interface Props {
  row: FishData;
  isExpanded: boolean;
  onToggle: () => void;
  showPrices: boolean;
  t: (key: string) => string;
  localizedNames?: Record<string, string>;
  choppedFishRequired?: number;
}

export default function ExpandableFishRow({ row, isExpanded, onToggle, showPrices, t, localizedNames, choppedFishRequired = 1 }: Props) {
  const profitPerRawFish = row.fishRequired > 0 ? row.profit / row.fishRequired : 0;
  const revenuePerChopped = row.choppedYield > 0 ? row.revenueTotal / row.choppedYield : 0;
  const costPerRawFish = row.fishCost;
  const totalCost = costPerRawFish * row.fishRequired;
  const totalRevenue = revenuePerChopped * row.choppedYield * (row.fishRequired / row.choppedYield);

  return (
    <>
      {/* Main Row - Simplified */}
      <tr
        onClick={onToggle}
        className={`
          cursor-pointer transition-all border-l-4
          ${isExpanded ? 'bg-muted/50 border-l-primary' :
            row.roi > 50 ? 'hover:bg-success/5 border-l-success/50' :
            row.roi > 20 ? 'hover:bg-warning/5 border-l-warning/50' :
            row.roi > 0 ? 'hover:bg-blue-500/5 border-l-blue-500/50' :
            'hover:bg-destructive/5 border-l-destructive/50'}
        `}
      >
        <td className="p-4 pl-6">
          <div className="flex items-center gap-3">
            <div className="text-muted-foreground shrink-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center border border-border relative shrink-0">
              <img
                src={`https://render.albiononline.com/v1/item/${row.id}`}
                className="h-8 w-8 object-contain"
                alt={localizedNames?.[row.id] || row.id}
              />
              <div className="absolute -bottom-1 -right-1 bg-background text-[10px] border border-border px-1 rounded-full font-mono text-muted-foreground">
                T{row.tier}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-foreground truncate">{localizedNames?.[row.id] || row.id}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                {row.isRare && <Badge variant="warning" className="text-xs shrink-0">Rare</Badge>}
                <span className="font-mono truncate">{row.id.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </td>

        {showPrices && (
          <td className="p-4 text-right font-mono text-muted-foreground whitespace-nowrap shrink-0">
            {row.fishPrice.toLocaleString()}
          </td>
        )}

        <td className="p-4 pr-6 text-right font-mono text-muted-foreground whitespace-nowrap shrink-0">
          {row.fishVolume.toLocaleString()}
        </td>
      </tr>

      {/* Expanded Details - Full Breakdown */}
      {isExpanded && (
        <tr>
          <td colSpan={showPrices ? 4 : 3} className="p-0 border-b border-border">
            <div className="bg-muted/30 p-4 sm:p-6 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                
                {/* Cost Breakdown */}
                <div className="space-y-3 min-w-0">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Coins className="h-4 w-4 shrink-0" />
                    {t('expanded.costBreakdown')}
                  </h4>
                  <div className="bg-card/50 rounded-lg p-3 sm:p-4 border border-border space-y-2 sm:space-y-3">
                    {showPrices && (
                      <>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.rawFishCost')}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-foreground whitespace-nowrap">{costPerRawFish.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.fishRequired')}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-foreground whitespace-nowrap">{row.fishRequired.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.choppedYield')}</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-foreground whitespace-nowrap">{row.choppedYield}</span>
                    </div>
                    <div className="h-px bg-border" />
                    {showPrices && (
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.totalCost')}</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-destructive whitespace-nowrap">{totalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Revenue & Price Analysis */}
                <div className="space-y-3 min-w-0">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 shrink-0" />
                    {t('expanded.revenueBreakdown')}
                  </h4>
                  <div className="bg-card/50 rounded-lg p-3 sm:p-4 border border-border space-y-2 sm:space-y-3">
                    {showPrices && (
                      <>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.pricePerChopped')}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-foreground whitespace-nowrap">{Math.round(row.pricePerChopped).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.revenuePerChopped')}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-success whitespace-nowrap">{Math.round(revenuePerChopped).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.targetAmount')}</span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-foreground whitespace-nowrap">{choppedFishRequired.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-border" />
                    {showPrices && (
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.totalRevenue')}</span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-success whitespace-nowrap">{totalRevenue.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profit Analysis */}
                <div className="space-y-3 min-w-0 sm:col-span-2 lg:col-span-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Scale className="h-4 w-4 shrink-0" />
                    {t('expanded.profitAnalysis')}
                  </h4>
                  <div className="bg-card/50 rounded-lg p-3 sm:p-4 border border-border space-y-2 sm:space-y-3">
                    {showPrices && (
                      <>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.profitPerRawFish')}</span>
                          <span className={`text-xs sm:text-sm font-mono font-bold whitespace-nowrap ${profitPerRawFish > 0 ? 'text-success' : 'text-destructive'}`}>
                            {profitPerRawFish.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.totalProfit')}</span>
                      <span className={`text-xs sm:text-sm font-mono font-bold whitespace-nowrap ${row.profit > 0 ? 'text-success' : 'text-destructive'}`}>
                        {row.profit > 0 ? '+' : ''}{row.profit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground truncate">{t('expanded.returnOnInvestment')}</span>
                      <span className={`text-xs sm:text-sm font-mono font-bold whitespace-nowrap ${row.roi > 0 ? 'text-success' : 'text-destructive'}`}>
                        {row.roi.toFixed(1)}%
                      </span>
                    </div>
                    {row.missingData && (
                      <div className="mt-3 p-2 sm:p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                        <p className="text-xs text-warning">{t('expanded.missingDataWarning')}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
