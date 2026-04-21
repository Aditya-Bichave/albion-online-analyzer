import React from 'react';

const RouteOverlay = ({ route, scale, playerX, playerY }) => {
    if (!route || !route.path || route.path.length === 0) return null;

    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3 }}>
            {route.path.map((node, i) => {
                const isFirst = i === 0;

                const prevNode = isFirst ? { x: playerX, y: playerY } : route.path[i-1];

                const startDx = (prevNode.x - playerX) * scale;
                const startDy = (prevNode.y - playerY) * scale;

                const endDx = (node.x - playerX) * scale;
                const endDy = (node.y - playerY) * scale;

                // Calculate distance and angle
                const distVmin = Math.hypot(endDx - startDx, endDy - startDy);
                const angleDeg = Math.atan2(endDy - startDy, endDx - startDx) * 180 / Math.PI;

                return (
                    <React.Fragment key={`route-step-${i}`}>
                        {/* Line Segment */}
                        <div style={{
                            position: 'absolute',
                            top: `${startDy}vmin`,
                            left: `${startDx}vmin`,
                            width: `${distVmin}vmin`,
                            height: '2px',
                            background: 'linear-gradient(90deg, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.8) 100%)',
                            transformOrigin: '0 50%',
                            transform: `rotate(${angleDeg}deg)`,
                            boxShadow: '0 0 8px rgba(34,211,238,0.4)',
                            zIndex: 3
                        }} />

                        {/* Waypoint Number */}
                        <div style={{
                            position: 'absolute',
                            top: `${endDy}vmin`,
                            left: `${endDx}vmin`,
                            transform: 'translate(-50%, -150%)',
                            background: 'rgba(34,211,238,0.9)',
                            color: '#000',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            fontFamily: '"Space Mono", monospace',
                            zIndex: 4,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            {i + 1}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default RouteOverlay;
