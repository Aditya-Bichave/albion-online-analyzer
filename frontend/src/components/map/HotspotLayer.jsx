import React from 'react';

const HotspotLayer = ({ hotspots, scale, playerX, playerY }) => {
    if (!hotspots || hotspots.length === 0) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 4 }}>
            {hotspots.map((hotspot, idx) => {
                const dx = (hotspot.x - playerX) * scale;
                const dy = (hotspot.y - playerY) * scale;

                // Hotspot radius based on count and spread (approximate)
                const radius = 20 + Math.min(hotspot.nodeCount * 4, 100);
                const scaledRadius = radius * scale;

                return (
                    <div key={hotspot.id} style={{
                        position: 'absolute',
                        top: `${dy}vmin`,
                        left: `${dx}vmin`,
                        transform: 'translate(-50%, -50%)',
                    }}>
                        {/* Glow / Heat Circle */}
                        <div style={{
                            width: `${scaledRadius * 2}vmin`,
                            height: `${scaledRadius * 2}vmin`,
                            borderRadius: '50%',
                            background: 'radial-gradient(circle at center, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 50%, transparent 100%)',
                            border: '1px dashed rgba(234, 179, 8, 0.3)',
                            pointerEvents: 'none'
                        }} />

                        {/* Label Badge */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'rgba(10, 12, 17, 0.85)',
                            border: '1px solid rgba(234, 179, 8, 0.5)',
                            color: 'var(--text-primary)',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: '"Space Mono", monospace',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px'
                        }}>
                            <span style={{ color: '#eab308' }}>#{idx + 1} HOTSPOT</span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem' }}>
                                {hotspot.nodeCount} {hotspot.dominantType} (avg T{hotspot.averageTier})
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default HotspotLayer;
