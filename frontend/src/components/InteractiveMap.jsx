import React, { useMemo, useState } from 'react';
import { getMapCalibration, MAP_VIEW_CALIBRATION } from '../mapCalibration';
import {
    formatMobDanger,
    getEnchantColor,
    getResourceColor,
    getThreatColor,
    getWorldEntityColor,
    getZonePvpColor
} from '../utils';
import { getValueColor } from '../utils/mapScoringUtils';
import { PRESETS } from '../utils/presetConfig';
import ResourceIcon from './ResourceIcon';
import WorldEntityAvatar from './WorldEntityAvatar';
import { useBestFarmingRoute } from './hooks/useBestFarmingRoute';
import { useHotspotDetection } from './hooks/useHotspotDetection';
import { useNodeScoring } from './hooks/useNodeScoring';
import HeatmapLayer from './map/HeatmapLayer';
import HotspotLayer from './map/HotspotLayer';
import RouteOverlay from './map/RouteOverlay';

const InteractiveMap = ({
    nodes,
    players = [],
    worldEntities = [],
    playerPos,
    playerTrail = [],
    zoneInfo,
    hostileAlert = null,
    compact = false,
    activePreset = PRESETS[0],
    showRoute = true,
    showHotspots = true,
    showHeatmap = true
}) => {
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });

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

    // Reset pan if player moves significantly
    const resetZoomAndPan = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const { scoredNodes, minVal, maxVal, minSpm, maxSpm } = useNodeScoring(nodes, activePreset);
    const hotspots = useHotspotDetection(scoredNodes, playerPos);
    const route = useBestFarmingRoute(scoredNodes, playerPos, activePreset.routeWeights);

    const renderedNodes = useMemo(() => {
        return scoredNodes.map(node => {
            const nodeX = getCoord(node.x);
            const nodeY = getCoord(node.y);
            const routeIndex = route.path.findIndex(routeNode => routeNode.id === node.id);

            return {
                ...node,
                dx: nodeX - playerX,
                dy: -(nodeY - playerY), // Negate dy because DOM y goes down, game y goes up
                distance: Math.hypot(nodeX - playerX, nodeY - playerY),
                routeIndex
            };
        });
    }, [playerX, playerY, route.path, scoredNodes]);

    const renderedPlayers = useMemo(() => {
        return players
            .filter(player => Number.isFinite(player?.position?.x) && Number.isFinite(player?.position?.y))
            .map(player => ({
                ...player,
                dx: player.position.x - playerX,
                dy: player.position.y - playerY,
                distance: Math.hypot(player.position.x - playerX, player.position.y - playerY)
            }));
    }, [players, playerX, playerY]);

    const renderedWorldEntities = useMemo(() => {
        return worldEntities
            .filter(entity => Number.isFinite(entity?.position?.x) && Number.isFinite(entity?.position?.y))
            .map(entity => ({
                ...entity,
                dx: entity.position.x - playerX,
                dy: entity.position.y - playerY,
                distance: Math.hypot(entity.position.x - playerX, entity.position.y - playerY)
            }));
    }, [worldEntities, playerX, playerY]);

    const formatCoord = (value) => value.toFixed(1);
    const mapSize = calibration.mapSize;
    const mapAsset = zoneInfo?.mapAsset ? `/albion-assets/maps/${zoneInfo.mapAsset}.webp` : null;
    const mapImageSize = Math.max(85, mapSize * scale * 1.12);

    const handleWheel = (event) => {
        event.preventDefault();
        if (event.deltaY < 0) {
            zoomIn();
            return;
        }

        zoomOut();
    };

    const handleMouseDown = (event) => {
        setIsDragging(true);
        setLastMouse({ x: event.clientX, y: event.clientY });
    };

    const handleMouseMove = (event) => {
        if (!isDragging) {
            return;
        }

        const dx = event.clientX - lastMouse.x;
        const dy = event.clientY - lastMouse.y;
        setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        setLastMouse({ x: event.clientX, y: event.clientY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const overlayInset = compact ? '12px' : '20px';
    const zoomLabelWidth = compact ? '60px' : '76px';

    return (
        <div
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#090a0d', cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            
            {/* Moving Grid Background to give infinite-scroll feel */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: `${8 * zoom}vmin ${8 * zoom}vmin`,
                backgroundPosition: `calc(${-playerX * scale}vmin + ${pan.x}px) calc(${playerY * scale}vmin + ${pan.y}px)`,
                transition: isDragging ? 'none' : 'background-position 0.2s linear',
                zIndex: 0
            }}></div>

            {/* Zone Info Overlay */}
            <div style={{
                position: 'absolute', top: overlayInset, left: compact ? '16px' : '30px', zIndex: 10,
                display: 'flex', flexDirection: 'column',
                maxWidth: compact ? '220px' : 'none'
            }}>
                <h1 style={{
                    fontSize: compact ? '1rem' : '2rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    whiteSpace: compact ? 'nowrap' : 'normal',
                    overflow: compact ? 'hidden' : 'visible',
                    textOverflow: compact ? 'ellipsis' : 'clip'
                }}>
                    {zoneInfo ? zoneInfo.name : 'Unknown Zone'}
                </h1>
                <span style={{
                    color: 'var(--text-secondary)',
                    fontFamily: '"Space Mono", monospace',
                    fontSize: compact ? '0.62rem' : '0.9rem'
                }}>
                    {compact
                        ? `${nodes.length} NODES // ${players.length} PLAYERS`
                        : `LIVE RADAR // ${nodes.length} MATCHING NODES // ${players.length} TRACKED PLAYERS`}
                </span>
                <span style={{ marginTop: '6px', color: 'var(--text-secondary)', fontFamily: '"Space Mono", monospace', fontSize: compact ? '0.66rem' : '0.8rem' }}>
                    PLAYER {formatCoord(playerX)}, {formatCoord(playerY)} // MAP {mapSize}u
                </span>
                <span style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: getZonePvpColor(zoneInfo?.pvpType),
                    fontFamily: '"Space Mono", monospace',
                    fontSize: compact ? '0.62rem' : '0.78rem'
                }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: getZonePvpColor(zoneInfo?.pvpType)
                    }} />
                    {(zoneInfo?.pvpType || 'safe').toUpperCase()} ZONE{zoneInfo?.tier ? ` // T${zoneInfo.tier}` : ''}
                </span>
            </div>

            <div style={{
                position: 'absolute',
                top: overlayInset,
                right: compact ? '14px' : '24px',
                zIndex: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: compact ? '8px' : '10px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: compact ? '8px 10px' : '10px 12px',
                    borderRadius: '12px',
                    background: 'rgba(10, 12, 17, 0.78)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <button
                        onClick={zoomOut}
                        style={{
                            width: compact ? '28px' : '34px',
                            height: compact ? '28px' : '34px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: compact ? '0.92rem' : '1.1rem'
                        }}
                        title="Zoom out"
                    >
                        -
                    </button>
                    <button
                        onClick={resetZoom}
                        style={{
                            minWidth: zoomLabelWidth,
                            height: compact ? '28px' : '34px',
                            padding: '0 12px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(34, 211, 238, 0.12)',
                            color: 'var(--accent-cyan)',
                            cursor: 'pointer',
                            fontSize: compact ? '0.66rem' : '0.78rem',
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
                            width: compact ? '28px' : '34px',
                            height: compact ? '28px' : '34px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: compact ? '0.92rem' : '1.1rem'
                        }}
                        title="Zoom in"
                    >
                        +
                    </button>
                </div>
                {!compact && (
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
                )}
                {hostileAlert && (
                    <div style={{
                        padding: compact ? '8px 10px' : '10px 12px',
                        borderRadius: '14px',
                        background: 'rgba(255, 93, 93, 0.12)',
                        border: '1px solid rgba(255, 93, 93, 0.28)',
                        color: '#ffd6d6',
                        maxWidth: compact ? '180px' : '280px',
                        textAlign: 'right'
                    }}>
                        <div style={{ fontSize: compact ? '0.62rem' : '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                            Threat Alert
                        </div>
                        <div style={{ marginTop: '4px', fontWeight: 700, fontSize: compact ? '0.78rem' : '1rem' }}>
                            {hostileAlert.name}
                        </div>
                    </div>
                )}
            </div>

            {MAP_VIEW_CALIBRATION.radarRingSizes.map(size => (
                <div
                    key={size}
                    style={{
                        position: 'absolute',
                        top: `calc(50% + ${pan.y}px)`,
                        left: `calc(50% + ${pan.x}px)`,
                        width: `${compact ? size * 0.92 : size}vmin`,
                        height: `${compact ? size * 0.92 : size}vmin`,
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.06)',
                        transition: isDragging ? 'none' : 'top 0.2s linear, left 0.2s linear',
                        pointerEvents: 'none',
                        zIndex: 1
                    }}
                />
            ))}

            {/* World Container (Centered at Player) */}
            <div style={{
                position: 'absolute', top: `calc(50% + ${pan.y}px)`, left: `calc(50% + ${pan.x}px)`,
                transition: isDragging ? 'none' : 'top 0.2s linear, left 0.2s linear',
                zIndex: 5
            }}>
                {mapAsset && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${mapImageSize}vmin`,
                        height: `${mapImageSize}vmin`,
                        transform: `translate(-50%, -50%) rotate(-45deg) translate(${-playerX * scale}vmin, ${playerY * scale}vmin)`,
                        transformOrigin: 'center center',
                        opacity: 0.34,
                        borderRadius: '28px',
                        overflow: 'hidden',
                        boxShadow: '0 0 80px rgba(34, 211, 238, 0.08)',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <img
                            src={mapAsset}
                            alt={zoneInfo?.name || 'Zone map'}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'saturate(0.92) contrast(1.05) brightness(0.82)'
                            }}
                        />
                    </div>
                )}

                {showHeatmap ? (
                    <HeatmapLayer playerTrail={playerTrail} scale={scale} playerX={playerX} playerY={playerY} />
                ) : playerTrail.map((point, index) => {
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

                {showHotspots && (
                    <HotspotLayer hotspots={hotspots} scale={scale} playerX={playerX} playerY={playerY} />
                )}

                {showRoute && (
                    <RouteOverlay route={route} scale={scale} playerX={playerX} playerY={playerY} />
                )}

                {renderedNodes.map(node => {
                    let baseColor = getResourceColor(node.type);
                    let borderColor = node.enchant > 0 ? getEnchantColor(node.enchant) : 'rgba(255,255,255,0.14)';
                    let glowColor = baseColor;

                    const colorMode = activePreset.colorMode;
                    if (colorMode === 'profit' && node.value) {
                        glowColor = getValueColor(node.value, minVal, maxVal);
                        baseColor = glowColor;
                    } else if (colorMode === 'spm' && node.spm) {
                        glowColor = getValueColor(node.spm, minSpm, maxSpm);
                        baseColor = glowColor;
                    }

                    if (colorMode === 'route' && node.routeIndex >= 0) {
                        glowColor = '#22d3ee';
                        baseColor = '#22d3ee';
                    } else if (colorMode === 'route') {
                        glowColor = 'rgba(255,255,255,0.1)';
                        baseColor = 'rgba(255,255,255,0.2)';
                        borderColor = 'rgba(255,255,255,0.05)';
                    }

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
                                border: `2px solid ${borderColor}`,
                                boxShadow: `0 0 ${node.routeIndex >= 0 ? '24px' : '16px'} ${glowColor}`,
                                transform: 'translate(-50%, -50%)',
                                transition: 'top 0.5s ease-out, left 0.5s ease-out',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)',
                                zIndex: node.routeIndex >= 0 ? 10 : 5
                             }}
                             title={`T${node.tier} ${node.type} ${node.enchant > 0 ? `.${node.enchant}` : ''} // ${Math.round(node.distance)}u // ${node.charges} charges
Value: ${Math.round(node.value || 0)} // SPM: ${Math.round(node.spm || 0)}${node.routeIndex >= 0 ? `
Route Step: ${node.routeIndex + 1}` : ''}`}
                        >
                            <ResourceIcon type={node.type} size={18} color={colorMode === 'type' ? undefined : baseColor} />
                            {node.enchant > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '3px',
                                    right: '3px',
                                    width: '7px',
                                    height: '7px',
                                    background: getEnchantColor(node.enchant),
                                    borderRadius: '50%',
                                    boxShadow: `0 0 8px ${getEnchantColor(node.enchant)}`,
                                    border: '1px solid rgba(255,255,255,0.75)'
                                }} />
                            )}
                        </div>
                    );
                })}

                {renderedPlayers.map(player => {
                    const threatColor = getThreatColor(player.threat);

                    return (
                        <div
                            key={`player-${player.id}`}
                            style={{
                                position: 'absolute',
                                top: `${player.dy * scale}vmin`,
                                left: `${player.dx * scale}vmin`,
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                zIndex: 9,
                                pointerEvents: 'none'
                            }}
                            title={`${player.name} // ${player.threat} // ${Math.round(player.distance)}u`}
                        >
                            <div style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                background: threatColor,
                                border: '2px solid rgba(255,255,255,0.9)',
                                boxShadow: `0 0 18px ${threatColor}`
                            }} />
                            <div style={{
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: 'rgba(5, 8, 12, 0.86)',
                                border: `1px solid ${threatColor}55`,
                                color: '#f8fafc',
                                fontSize: '0.68rem',
                                fontFamily: '"Space Mono", monospace',
                                whiteSpace: 'nowrap'
                            }}>
                                {player.name}
                            </div>
                        </div>
                    );
                })}

                {renderedWorldEntities.map(entity => {
                    const entityColor = getWorldEntityColor(entity);
                    const markerSize = entity.kind === 'mob' ? (compact ? 22 : 28) : (compact ? 18 : 22);

                    return (
                        <div
                            key={entity.uid}
                            style={{
                                position: 'absolute',
                                top: `${entity.dy * scale}vmin`,
                                left: `${entity.dx * scale}vmin`,
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '6px',
                                zIndex: entity.kind === 'mob' ? 8 : 7,
                                pointerEvents: 'none'
                            }}
                            title={`${entity.label} // ${entity.kind} // ${Math.round(entity.distance)}u`}
                        >
                            <div style={{
                                minWidth: `${markerSize}px`,
                                minHeight: `${markerSize}px`,
                                borderRadius: entity.kind === 'dungeon' ? '8px' : '999px',
                                background: 'rgba(5, 8, 12, 0.86)',
                                border: `1px solid ${entityColor}66`,
                                boxShadow: `0 0 20px ${entityColor}55`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: entity.kind === 'mob' ? '2px' : '0 8px'
                            }}>
                                {entity.kind === 'mob'
                                    ? <WorldEntityAvatar entity={entity} size={markerSize} />
                                    : (
                                        <span style={{
                                            color: entityColor,
                                            fontSize: '0.72rem',
                                            fontWeight: 800,
                                            fontFamily: '"Space Mono", monospace'
                                        }}>
                                            {entity.kind === 'dungeon' ? 'D' : entity.kind === 'chest' ? 'C' : entity.kind === 'fishing' ? 'F' : entity.kind === 'mist' ? 'M' : entity.kind === 'wisp' ? 'W' : 'G'}
                                        </span>
                                    )}
                            </div>
                            <div style={{
                                maxWidth: entity.kind === 'mob' ? (compact ? '100px' : '130px') : (compact ? '92px' : '120px'),
                                padding: '2px 8px',
                                borderRadius: '999px',
                                background: 'rgba(5, 8, 12, 0.86)',
                                border: `1px solid ${entityColor}44`,
                                color: '#f8fafc',
                                fontSize: compact ? '0.58rem' : '0.66rem',
                                fontFamily: '"Space Mono", monospace',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {entity.kind === 'mob' && entity.danger
                                    ? `${entity.label} // ${formatMobDanger(entity.danger)}`
                                    : entity.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Static Player Blip perfectly locked to the absolute center of screen */}
            <div style={{
                    position: 'absolute',
                    top: `calc(50% + ${pan.y}px)`,
                    left: `calc(50% + ${pan.x}px)`,
                    width: compact ? '13px' : '16px',
                    height: compact ? '13px' : '16px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--text-primary)',
                    border: '3px solid var(--accent-cyan)',
                    boxShadow: '0 0 20px var(--accent-cyan)',
                    transform: 'translate(-50%, -50%)',
                    transition: isDragging ? 'none' : 'top 0.2s linear, left 0.2s linear',
                    zIndex: 100
            }}></div>
            
            {/* Center crosshair for UI flair */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '1px', height: compact ? '14px' : '20px', backgroundColor: 'rgba(255,255,255,0.2)', pointerEvents: 'none'
            }}/>
            <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: compact ? '14px' : '20px', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', pointerEvents: 'none'
            }}/>

            {(pan.x !== 0 || pan.y !== 0) && (
                <button
                    onClick={resetZoomAndPan}
                    style={{
                        position: 'absolute',
                        bottom: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '8px 16px',
                        background: 'rgba(34, 211, 238, 0.12)',
                        border: '1px solid var(--accent-cyan)',
                        color: 'var(--accent-cyan)',
                        borderRadius: '999px',
                        cursor: 'pointer',
                        zIndex: 15,
                        fontFamily: '"Space Mono", monospace',
                        fontWeight: 700,
                        backdropFilter: 'blur(4px)'
                    }}
                >
                    RECENTER
                </button>
            )}
        </div>
    );
};

export default InteractiveMap;
