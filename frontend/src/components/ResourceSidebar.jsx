import React, { useMemo } from 'react';
import { getResourceColor, getEnchantColor } from '../utils';
import { PRESETS, getColorModeLabel } from '../utils/presetConfig';
import { useNodeScoring } from './hooks/useNodeScoring';
import { useHotspotDetection } from './hooks/useHotspotDetection';
import { useBestFarmingRoute } from './hooks/useBestFarmingRoute';
import ResourceIcon from './ResourceIcon';

const ResourceSidebar = ({ nodes, filters, setFilters, activePresetId = "default", setActivePresetId = () => {}, showRoute = true, setShowRoute = () => {}, showHotspots = true, setShowHotspots = () => {}, showHeatmap = true, setShowHeatmap = () => {}, activePreset = PRESETS[0] }) => {
    
    // Toggle Helpers

    const setCustomPreset = () => {
        if (activePresetId !== 'custom') {
            setActivePresetId('custom');
        }
    };

    const toggleType = (type) => {
        setCustomPreset();
        setFilters(prev => ({

            ...prev,
            types: prev.types.includes(type) ? prev.types.filter(t => t !== type) : [...prev.types, type]
        }));
    };

    const toggleTier = (tier) => {
        setCustomPreset();
        setFilters(prev => ({
            ...prev,
            tiers: prev.tiers.includes(tier) ? prev.tiers.filter(t => t !== tier) : [...prev.tiers, tier]
        }));
    };

    const toggleEnchant = (lvl) => {
        setCustomPreset();
        setFilters(prev => ({ ...prev, minEnchant: prev.minEnchant === lvl ? 0 : lvl }));
    };

    // Compute hotspots and route for the sidebar
    const { scoredNodes } = useNodeScoring(nodes, activePreset);
    const hotspots = useHotspotDetection(scoredNodes, null);
    const route = useBestFarmingRoute(scoredNodes, null, activePreset.routeWeights);

    // Generate counts

    const stats = useMemo(() => {
        const aggr = {};
        for (const n of nodes) {
            if (!aggr[n.type]) aggr[n.type] = { total: 0, tiers: {}, enchants: {} };
            
            aggr[n.type].total++;
            
            // Count Tiers
            if (!aggr[n.type].tiers[n.tier]) aggr[n.type].tiers[n.tier] = 0;
            aggr[n.type].tiers[n.tier]++;
            
            // Count Enchants
            if (n.enchant > 0) {
                if (!aggr[n.type].enchants[n.enchant]) aggr[n.type].enchants[n.enchant] = 0;
                aggr[n.type].enchants[n.enchant]++;
            }
        }
        return aggr;
    }, [nodes]);

    return (
        <div className="glass-panel" style={{
            width: '320px', 
            height: '100%', 
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
        }}>

            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, paddingBottom: '12px', borderBottom: '1px solid var(--border-active)' }}>
                    FARMING ASSISTANT
                </h2>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Presets */}
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>MAP PRESET:</div>
                        <select
                            value={activePresetId}
                            onChange={(e) => setActivePresetId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--border-subtle)',
                                color: 'var(--text-primary)',
                                borderRadius: '4px',
                                outline: 'none'
                            }}
                        >
                            {PRESETS.map(p => (
                                <option key={p.id} value={p.id} style={{ background: 'var(--bg-surface)' }}>{p.label}</option>
                            ))}
                            <option value="custom" style={{ background: 'var(--bg-surface)' }}>Custom</option>
                        </select>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>COLOR MODE: <strong style={{color: 'var(--accent-cyan)'}}>{getColorModeLabel(activePreset.colorMode)}</strong></span>
                        </div>
                    </div>

                    {/* Overlays */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                        <button
                            onClick={() => setShowRoute(!showRoute)}
                            style={{
                                flex: 1,
                                background: showRoute ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: showRoute ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                                border: `1px solid ${showRoute ? 'rgba(34, 211, 238, 0.5)' : 'transparent'}`,
                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                cursor: 'pointer', fontWeight: showRoute ? 700 : 400
                            }}
                        >
                            Best Route
                        </button>
                        <button
                            onClick={() => setShowHotspots(!showHotspots)}
                            style={{
                                flex: 1,
                                background: showHotspots ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: showHotspots ? '#eab308' : 'var(--text-secondary)',
                                border: `1px solid ${showHotspots ? 'rgba(234, 179, 8, 0.5)' : 'transparent'}`,
                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                cursor: 'pointer', fontWeight: showHotspots ? 700 : 400
                            }}
                        >
                            Hotspots
                        </button>
                        <button
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            style={{
                                flex: 1,
                                background: showHeatmap ? 'rgba(192, 132, 252, 0.2)' : 'rgba(255,255,255,0.05)',
                                color: showHeatmap ? 'var(--accent-purple)' : 'var(--text-secondary)',
                                border: `1px solid ${showHeatmap ? 'rgba(192, 132, 252, 0.5)' : 'transparent'}`,
                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                cursor: 'pointer', fontWeight: showHeatmap ? 700 : 400
                            }}
                        >
                            Heatmap
                        </button>
                    </div>
                </div>


                
                {filters && (
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Type Filters */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {['wood', 'ore', 'fiber', 'hide', 'stone'].map(type => {
                                const active = filters.types.includes(type);
                                return (
                                    <button 
                                        key={type}
                                        onClick={() => toggleType(type)}
                                        style={{ 
                                            background: active ? getResourceColor(type) : 'rgba(255,255,255,0.05)',
                                            color: active ? '#000' : 'var(--text-secondary)',
                                            border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                            cursor: 'pointer', fontWeight: active ? 700 : 400, textTransform: 'uppercase',
                                            display: 'inline-flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        <ResourceIcon type={type} size={14} color={active ? '#000' : getResourceColor(type)} muted={!active} />
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Tier Filters */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center'}}>Tiers:</span>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(tier => {
                                const active = filters.tiers.includes(tier);
                                return (
                                    <button 
                                        key={tier}
                                        onClick={() => toggleTier(tier)}
                                        style={{ 
                                            background: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                            color: active ? '#fff' : 'var(--text-secondary)',
                                            border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        T{tier}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Enchant Filters */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            <span style={{fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center'}}>Min Ench:</span>
                            {[1, 2, 3, 4].map(e => {
                                const active = filters.minEnchant === e;
                                return (
                                    <button 
                                        key={e}
                                        onClick={() => toggleEnchant(e)}
                                        style={{ 
                                            background: active ? getEnchantColor(e) : 'rgba(255,255,255,0.05)',
                                            color: active ? '#000' : 'var(--text-secondary)',
                                            border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                            cursor: 'pointer', fontWeight: active ? 700 : 400
                                        }}
                                    >
                                        .{e}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Farming Intel Summary */}
                {(route.path.length > 0 || hotspots.length > 0) && (
                    <div style={{
                        background: 'rgba(34, 211, 238, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(34, 211, 238, 0.2)',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1px' }}>FARMING INTEL</div>
                        {route.path.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Suggested Route:</span>
                                <strong>{Math.round(route.totalValue)} Val / {route.path.length} Nodes</strong>
                            </div>
                        )}
                        {hotspots.length > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Top Hotspot:</span>
                                <strong>#{1} - {hotspots[0].nodeCount} {hotspots[0].dominantType}</strong>
                            </div>
                        )}
                    </div>
                )}

                {Object.keys(stats).length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Scanning for resources...
                    </div>
                )}
                
                {Object.keys(stats).sort().map(type => {
                    const s = stats[type];
                    return (
                        <div key={type} style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-subtle)',
                            padding: '16px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '999px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--border-subtle)'
                                    }}>
                                        <ResourceIcon type={type} size={16} />
                                    </div>
                                    <h3 style={{ textTransform: 'capitalize', fontWeight: 600, margin: 0 }}>{type}</h3>
                                </div>
                                <span style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                    {s.total} Nodes
                                </span>
                            </div>

                            {/* Tiers distribution */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                                {Object.keys(s.tiers).sort().map(t => (
                                    <div key={t} style={{
                                        fontSize: '0.75rem', padding: '2px 6px',
                                        background: 'rgba(255,255,255,0.05)', borderRadius: '4px',
                                        color: 'var(--text-secondary)'
                                    }}>
                                        T{t}: <span style={{ color: 'var(--text-primary)' }}>{s.tiers[t]}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Enchants highlights */}
                            {Object.keys(s.enchants).length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {Object.keys(s.enchants).sort().map(e => (
                                        <div key={e} style={{
                                            fontSize: '0.75rem', padding: '2px 6px',
                                            border: `1px solid ${getEnchantColor(parseInt(e))}`, borderRadius: '4px',
                                            color: getEnchantColor(parseInt(e)),
                                            fontWeight: 600
                                        }}>
                                            .{e} : {s.enchants[e]}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResourceSidebar;
