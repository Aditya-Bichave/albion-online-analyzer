'use client';

import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';

interface Props {
  roi: number;
  profit: number;
  volume?: number;
  showTooltip?: boolean;
}

export default function ProfitabilityBadge({ roi, profit, volume = 0, showTooltip = true }: Props) {
  // Determine profitability level
  const getProfitabilityLevel = () => {
    if (profit <= 0) return { level: 'loss', label: 'Loss', variant: 'destructive' as const };
    if (roi >= 50) return { level: 'excellent', label: 'Excellent', variant: 'success' as const };
    if (roi >= 20) return { level: 'good', label: 'Good', variant: 'warning' as const };
    return { level: 'poor', label: 'Poor', variant: 'secondary' as const };
  };

  // Determine volume level
  const getVolumeLevel = () => {
    if (volume <= 0) return { level: 'no-volume', label: 'No Volume', variant: 'destructive' as const };
    if (volume >= 1000) return { level: 'high', label: 'High Vol', variant: 'success' as const };
    if (volume >= 100) return { level: 'medium', label: 'Med Vol', variant: 'warning' as const };
    return { level: 'low', label: 'Low Vol', variant: 'secondary' as const };
  };

  const profitability = getProfitabilityLevel();
  const volumeLevel = getVolumeLevel();

  const badgeContent = (
    <div className="flex items-center gap-2">
      <Badge 
        variant={profitability.variant}
        className="text-xs font-bold"
      >
        {profitability.label}
      </Badge>
      
      <Badge 
        variant={volumeLevel.variant}
        className="text-xs font-bold hidden sm:inline-flex"
      >
        {volumeLevel.label}
      </Badge>
    </div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <Tooltip
      content={
        <div className="space-y-2 text-xs">
          <div className="font-bold text-foreground">Profitability Analysis</div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-muted-foreground">ROI</div>
              <div className={`font-bold ${roi > 0 ? 'text-success' : 'text-destructive'}`}>
                {roi.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Profit</div>
              <div className={`font-bold ${profit > 0 ? 'text-success' : 'text-destructive'}`}>
                {profit.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Volume</div>
              <div className={`font-bold ${volume > 0 ? 'text-foreground' : 'text-destructive'}`}>
                {volume.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Rating</div>
              <div className={`font-bold ${
                profitability.variant === 'success' ? 'text-success' : 
                profitability.variant === 'warning' ? 'text-warning' :
                profitability.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'
              }`}>
                {profitability.label}
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="cursor-help">{badgeContent}</div>
    </Tooltip>
  );
}
