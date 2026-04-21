import React, { useMemo } from 'react';

const HeatmapLayer = ({ playerTrail, scale, playerX, playerY }) => {
    // Heatmap fades based on index. The newest points are bright, oldest fade to transparent.
    // playerTrail typically holds max 18 points from existing code, but maybe more later.

    const renderedTrail = useMemo(() => {
        if (!playerTrail || playerTrail.length === 0) return null;

        return playerTrail.map((point, index) => {
            const dx = (point.x - playerX) * scale;
            const dy = (point.y - playerY) * scale;
            const progress = (index + 1) / Math.max(playerTrail.length, 1);

            return (
                <div
                    key={`trail-${index}-${point.x}-${point.y}`}
                    style={{
                        position: 'absolute',
                        top: `${dy}vmin`,
                        left: `${dx}vmin`,
                        width: `${4 + progress * 8}px`,
                        height: `${4 + progress * 8}px`,
                        borderRadius: '50%',
                        background: 'rgba(34, 211, 238, 0.4)',
                        border: '1px solid rgba(34, 211, 238, 0.6)',
                        boxShadow: `0 0 ${10 + progress * 10}px rgba(34, 211, 238, ${0.2 + progress * 0.4})`,
                        opacity: 0.1 + progress * 0.7,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
            );
        });
    }, [playerTrail, scale, playerX, playerY]);

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            {renderedTrail}
        </div>
    );
};

export default HeatmapLayer;
