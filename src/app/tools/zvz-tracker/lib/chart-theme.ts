// Chart Theme & Styling for ZvZ Tracker
// Consistent color scheme matching Albion Online factions and project design system

export const CHART_COLORS = {
  // Project Design System Colors
  primary: '#d97706',      // Amber-600
  primaryLight: '#fbbf24', // Amber-400
  primaryDark: '#b45309',  // Amber-700
  
  success: '#10b981',      // Emerald-500
  successLight: '#34d399', // Emerald-400
  
  destructive: '#ef4444',  // Red-500
  destructiveLight: '#f87171', // Red-400
  
  warning: '#eab308',      // Yellow-500
  warningLight: '#facc15', // Yellow-400
  
  info: '#3b82f6',         // Blue-500
  infoLight: '#60a5fa',    // Blue-400
  
  // Faction Colors (Albion Online)
  faction1: '#dc2626',     // Red faction
  faction2: '#2563eb',     // Blue faction
  faction3: '#16a34a',     // Green faction
  faction4: '#ca8a04',     // Yellow faction
  
  // Neutral Colors
  muted: '#a8a29e',        // stone-400
  mutedLight: '#d6d3d1',   // stone-300
  background: '#0c0a09',   // stone-950
};

export const CHART_GRADIENTS = {
  // Primary amber gradient for area charts
  primary: {
    start: '#fbbf24',      // Amber-400
    end: '#d9770600',      // Amber-600 with 0 opacity
  },
  
  // Success gradient
  success: {
    start: '#34d399',      // Emerald-400
    end: '#10b98100',      // Emerald-500 with 0 opacity
  },
  
  // Destructive gradient
  destructive: {
    start: '#f87171',      // Red-400
    end: '#ef444400',      // Red-500 with 0 opacity
  },
  
  // Faction gradients
  faction1: {
    start: '#dc2626',
    end: '#dc262600',
  },
  faction2: {
    start: '#2563eb',
    end: '#2563eb00',
  },
  faction3: {
    start: '#16a34a',
    end: '#16a34a00',
  },
  faction4: {
    start: '#ca8a04',
    end: '#ca8a0400',
  },
};

export const COMMON_CHART_PROPS = {
  responsive: true,
  height: 400,
  className: 'w-full',
};

// Faction color mapping by faction name/ID
export const getFactionColor = (factionId: string | undefined, index: number): string => {
  // Handle undefined or null factionId
  if (!factionId) {
    const colors = [
      CHART_COLORS.faction1,
      CHART_COLORS.faction2,
      CHART_COLORS.faction3,
      CHART_COLORS.faction4,
    ];
    return colors[index % colors.length];
  }

  const factionColors: Record<string, string> = {
    'red': CHART_COLORS.faction1,
    'blue': CHART_COLORS.faction2,
    'green': CHART_COLORS.faction3,
    'yellow': CHART_COLORS.faction4,
  };

  // Try to match by name
  const lowerId = factionId.toLowerCase();
  for (const [key, color] of Object.entries(factionColors)) {
    if (lowerId.includes(key)) return color;
  }

  // Fallback to cycle through colors
  const colors = [
    CHART_COLORS.faction1,
    CHART_COLORS.faction2,
    CHART_COLORS.faction3,
    CHART_COLORS.faction4,
  ];

  return colors[index % colors.length];
};

// Player color assignment for multi-player charts
export const getPlayerColor = (index: number): string => {
  const colors = [
    CHART_COLORS.primary,
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.destructive,
  ];
  
  return colors[index % colors.length];
};

// Intensity color based on battle intensity level
export const getIntensityColor = (level: 'low' | 'medium' | 'high' | 'extreme'): string => {
  switch (level) {
    case 'low': return CHART_COLORS.success;
    case 'medium': return CHART_COLORS.warning;
    case 'high': return CHART_COLORS.primary;
    case 'extreme': return CHART_COLORS.destructive;
    default: return CHART_COLORS.muted;
  }
};

// Chart typography
export const CHART_TYPOGRAPHY = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: {
    small: 11,
    medium: 13,
    large: 15,
  },
  fontWeight: {
    normal: 400,
    semibold: 600,
    bold: 700,
  },
};

// Common chart styling
export const CHART_STYLES = {
  gridLine: {
    stroke: '#292524',     // stone-800
    strokeDasharray: '3 3',
    opacity: 0.5,
  },
  axis: {
    stroke: '#a8a29e',     // stone-400
    fontSize: 12,
  },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    border: '2px solid hsl(var(--border))',
    borderRadius: '1rem',
    padding: '1rem',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};
