import React, { useMemo, useState } from 'react';
import { getMapCalibration, MAP_VIEW_CALIBRATION } from '../mapCalibration';
import { getResourceColor, getEnchantColor } from '../utils';
import ResourceIcon from './ResourceIcon';

const InteractiveMap = ({ nodes, playerPos, playerTrail = [], zoneInfo }) => {
    const [zoom, setZoom] = useState(1);

    const getCoord = (val) => {
        const parsed = Number.parseFloat(val);
        return Number.isFinite(parsed) ? parsed : 0;
    };

    const calibration = getMapCalibration(zoneInfo);
    const clampZoom = (value) => Math.min(calibration.zoom.max, Math.max(calibration.zoom.min, value));
    const zoomIn = () => setZoom(prev => clampZoom(prev * calibration.zoom.step));
    const zoomOut = () => setZoom(prev => clampZoom(prev / calibration.zoom.step));
    const resetZoom = () => setZoom(1);

    const playerX = getCoord(playerPos?.x);
    const playerY = getCoord(playerPos?.y);
    const scale = calibration.scaleAtZoomOne * zoom;

    const renderedNodes = useMemo(() => {
        return nodes.map(node => {
            const nodeX = getCoord(node.x);
            const nodeY = getCoord(node.y);

            return {
                ...node,
                dx: nodeX - playerX,
                dy: nodeY - playerY,
                distance: Math.hypot(nodeX - playerX, nodeY - playerY)
            };
        });
    }, [nodes, playerX, playerY]);

    const formatCoord = (value) => value.toFixed(1);
    const mapSize = calibration.mapSize;

    const handleWheel = (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            zoomIn();
            return;
        }

        zoomOut();
    };

    return (
        <div
            onWheel={handleWheel}
            style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#090a0d' }}
        >
            
            {/* Moving Grid Background to give infinite-scroll feel */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: `${8 * zoom}vmin ${8 * zoom}vmin`,
                backgroundPosition: `${-playerX * scale}vmin ${-playerY * scale}vmin`,
                transition: 'background-position 0.2s linear',
                zIndex: 0
            }}></div>

            {/* Zone Info Overlay */}
            <div style={{
                position: 'absolute', top: '20px', left: '30px', zIndex: 10,
                display: 'flex', flexDirection: 'column'
            }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {zoneInfo ? zoneInfo.name : 'Unknown Zone'}
                </h1>
                <span style={{ color: 'var(--text-secondary)', fontFamily: '"Space Mono", monospace' }}>
                    LIVE RADAR // {nodes.length} MATCHING NODES
                </span>
                <span style={{ marginTop: '6px', color: 'var(--text-secondary)', fontFamily: '"Space Mono", monospace', fontSize: '0.8rem' }}>
                    PLAYER {formatCoord(playerX)}, {formatCoord(playerY)} // MAP {mapSize}u
                </span>
            </div>

            <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                zIndex: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '10px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(10, 12, 17, 0.78)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <button
                        onClick={zoomOut}
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                        title="Zoom out"
                    >
                        -
                    </button>
                    <button
                        onClick={resetZoom}
                        style={{
                            minWidth: '76px',
                            height: '34px',
                            padding: '0 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(34, 211, 238, 0.12)',
                            color: 'var(--accent-cyan)',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            fontFamily: '"Space Mono", monospace'
                        }}
                        title="Reset zoom"
                    >
                        {zoom.toFixed(2)}x
                    </button>
                    <button
                        onClick={zoomIn}
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '1.1rem'
                        }}
                        title="Zoom in"
                    >
                        +
                    </button>
                </div>
                <div style={{
                    padding: '8px 12px',
                    borderRadius: '999px',
                    background: 'rgba(10, 12, 17, 0.72)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.72rem',
                    fontFamily: '"Space Mono", monospace'
                }}>
                    SCROLL TO ZOOM
                </div>
            </div>

            {MAP_VIEW_CALIBRATION.radarRingSizes.map(size => (
                <div
                    key={size}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: `${size}vmin`,
                        height: `${size}vmin`,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.06)',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
            ))}

            {/* World Container (Centered at Player) */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                zIndex: 5
            }}>
                {playerTrail.map((point, index) => {
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
                                width: `${4 + progress * 5}px`,
                                height: `${4 + progress * 5}px`,
                                borderRadius: '50%',
                                background: 'rgba(34, 211, 238, 0.2)',
                                border: '1px solid rgba(34, 211, 238, 0.35)',
                                boxShadow: '0 0 12px rgba(34, 211, 238, 0.18)',
                                opacity: 0.2 + progress * 0.45,
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none'
                            }}
                        />
                    );
                })}

                {renderedNodes.map(node => {
                    const baseColor = getResourceColor(node.type);
                    const enchColor = getEnchantColor(node.enchant);

                    return (
                        <div key={node.id} 
                             className="radar-ping"
                             style={{
                                position: 'absolute',
                                top: `${node.dy * scale}vmin`,
                                left: `${node.dx * scale}vmin`,
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.16), rgba(6,10,14,0.94))',
                                border: `2px solid ${node.enchant > 0 ? enchColor : 'rgba(255,255,255,0.14)'}`,
                                boxShadow: `0 0 16px ${baseColor}`,
                                transform: 'translate(-50%, -50%)',
                                borderColor: node.enchant > 0 ? enchColor : undefined,
                                transition: 'top 0.5s ease-out, left 0.5s ease-out',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)'
                             }}
                             title={`T${node.tier} ${node.type} ${node.enchant > 0 ? `.${node.enchant}` : ''} // ${Math.round(node.distance)}u // ${node.charges} charges`}
                        >
                            <ResourceIcon type={node.type} size={18} />
                            {node.enchant > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    right: '3px',
                                    width: '7px',
                                    height: '7px',
                                    background: enchColor,
                                    borderRadius: '50%',
                                    boxShadow: `0 0 8px ${enchColor}`,
                                    border: '1px solid rgba(255,255,255,0.75)'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Static Player Blip perfectly locked to the absolute center of screen */}
            <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                    border: '3px solid var(--accent-cyan)',
                    boxShadow: '0 0 20px var(--accent-cyan)',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100
            }}></div>
            
            {/* Center crosshair for UI flair */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)', pointerEvents: 'none'
            }}/>
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '20px', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', pointerEvents: 'none'
            }}/>
        </div>
    );
};

export default InteractiveMap;
