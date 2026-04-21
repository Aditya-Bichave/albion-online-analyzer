import React, { useMemo } from 'react';
import {
    formatThreatLabel,
    formatWorldEntityKind,
    formatMobDanger,
    getChestRarityLabel,
    getThreatColor,
    getWorldEntityColor
} from '../utils';
import WorldEntityAvatar from './WorldEntityAvatar';

const PLAYER_FILTERS = [
    { key: 'hostile', label: 'Hostile' },
    { key: 'faction', label: 'Faction' },
    { key: 'passive', label: 'Passive' }
];

const WORLD_FILTERS = [
    { key: 'mob', label: 'Mobs' },
    { key: 'mist', label: 'Mists' },
    { key: 'dungeon', label: 'Dungeons' },
    { key: 'chest', label: 'Chests' },
    { key: 'fishing', label: 'Fishing' },
    { key: 'cage', label: 'Cages' },
    { key: 'wisp', label: 'Wisps' }
];

const PlayerSidebar = ({ players, playerFilters, setPlayerFilters, hostileAlert, worldEntities = [], worldFilters, setWorldFilters }) => {
    const counts = useMemo(() => {
        return players.reduce((accumulator, player) => {
            const key = player.threat || 'passive';
            accumulator[key] = (accumulator[key] || 0) + 1;
            return accumulator;
        }, {
            hostile: 0,
            faction: 0,
            passive: 0
        });
    }, [players]);

    const visiblePlayers = useMemo(() => {
        return [...players]
            .filter(player => playerFilters[player.threat] !== false)
            .sort((left, right) => {
                const threatWeight = {
                    hostile: 0,
                    faction: 1,
                    passive: 2
                };
                const leftWeight = threatWeight[left.threat] ?? 3;
                const rightWeight = threatWeight[right.threat] ?? 3;

                if (leftWeight !== rightWeight) {
                    return leftWeight - rightWeight;
                }

                return (right.lastSeenAt || 0) - (left.lastSeenAt || 0);
            });
    }, [playerFilters, players]);

    const toggleThreat = (key) => {
        setPlayerFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const worldCounts = useMemo(() => {
        return worldEntities.reduce((accumulator, entity) => {
            const key = entity.kind || 'unknown';
            accumulator[key] = (accumulator[key] || 0) + 1;
            return accumulator;
        }, {});
    }, [worldEntities]);

    const visibleWorldEntities = useMemo(() => {
        return [...worldEntities]
            .filter(entity => worldFilters?.[entity.kind] !== false)
            .sort((left, right) => {
                const weight = {
                    mob: 0,
                    mist: 1,
                    dungeon: 2,
                    chest: 3,
                    fishing: 4,
                    cage: 5,
                    wisp: 6
                };
                const leftWeight = weight[left.kind] ?? 9;
                const rightWeight = weight[right.kind] ?? 9;
                if (leftWeight !== rightWeight) {
                    return leftWeight - rightWeight;
                }

                return (right.lastSeenAt || 0) - (left.lastSeenAt || 0);
            })
            .slice(0, 80);
    }, [worldEntities, worldFilters]);

    const toggleWorldKind = (key) => {
        setWorldFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="glass-panel" style={{
            width: '320px',
            height: '100%',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            borderLeft: '1px solid rgba(255,255,255,0.06)'
        }}>
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, paddingBottom: '12px', borderBottom: '1px solid var(--border-active)' }}>
                    PLAYER INTEL
                </h2>
                <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {PLAYER_FILTERS.map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => toggleThreat(filter.key)}
                            style={{
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 8px',
                                background: playerFilters[filter.key]
                                    ? `${getThreatColor(filter.key)}22`
                                    : 'rgba(255,255,255,0.05)',
                                color: playerFilters[filter.key]
                                    ? getThreatColor(filter.key)
                                    : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.72rem'
                            }}
                        >
                            <div>{filter.label}</div>
                            <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>{counts[filter.key] || 0}</div>
                        </button>
                    ))}
                </div>
            </div>

            {hostileAlert && (
                <div style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 93, 93, 0.12)',
                    border: '1px solid rgba(255, 93, 93, 0.32)',
                    color: '#ffd4d4'
                }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        Hostile Detected
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '0.86rem' }}>
                        {hostileAlert.name}
                    </div>
                    {(hostileAlert.guildName || hostileAlert.allianceName) && (
                        <div style={{ marginTop: '4px', color: 'rgba(255,255,255,0.72)', fontSize: '0.78rem' }}>
                            {[hostileAlert.guildName, hostileAlert.allianceName].filter(Boolean).join(' // ')}
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {visiblePlayers.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No tracked players for the active filters.
                    </div>
                )}

                {visiblePlayers.map(player => (
                    <div
                        key={player.id}
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                            border: `1px solid ${getThreatColor(player.threat)}44`,
                            padding: '12px 14px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ fontWeight: 700 }}>{player.name}</div>
                            <div style={{
                                padding: '4px 8px',
                                borderRadius: '999px',
                                background: `${getThreatColor(player.threat)}22`,
                                color: getThreatColor(player.threat),
                                fontSize: '0.72rem',
                                fontWeight: 700
                            }}>
                                {formatThreatLabel(player.threat)}
                            </div>
                        </div>
                        {(player.guildName || player.allianceName) && (
                            <div style={{ marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {[player.guildName, player.allianceName].filter(Boolean).join(' // ')}
                            </div>
                        )}
                        <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                            {player.position
                                ? `Seen at ${player.position.x.toFixed(1)}, ${player.position.y.toFixed(1)}`
                                : 'Position not available yet'}
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, paddingBottom: '12px', borderBottom: '1px solid var(--border-active)' }}>
                    WORLD INTEL
                </h2>
                <div style={{ marginTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {WORLD_FILTERS.map(filter => (
                        <button
                            key={filter.key}
                            onClick={() => toggleWorldKind(filter.key)}
                            style={{
                                border: 'none',
                                borderRadius: '999px',
                                padding: '8px 10px',
                                background: worldFilters?.[filter.key]
                                    ? `${getWorldEntityColor({ kind: filter.key })}22`
                                    : 'rgba(255,255,255,0.05)',
                                color: worldFilters?.[filter.key]
                                    ? getWorldEntityColor({ kind: filter.key })
                                    : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.72rem'
                            }}
                        >
                            {filter.label} {worldCounts[filter.key] || 0}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {visibleWorldEntities.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        No world entities for the active filters.
                    </div>
                )}

                {visibleWorldEntities.map(entity => (
                    <div
                        key={entity.uid}
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '10px',
                            border: `1px solid ${getWorldEntityColor(entity)}44`,
                            padding: '12px 14px'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <WorldEntityAvatar entity={entity} size={34} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {entity.label}
                                </div>
                                <div style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                                    {formatWorldEntityKind(entity.kind)}
                                    {entity.kind === 'mob' && entity.danger ? ` // ${formatMobDanger(entity.danger)}` : ''}
                                    {entity.kind === 'chest' && entity.rarity ? ` // ${getChestRarityLabel(entity.rarity)}` : ''}
                                    {entity.kind === 'dungeon' && entity.dungeonType ? ` // ${entity.dungeonType}` : ''}
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.76rem' }}>
                            {entity.position
                                ? `Seen at ${entity.position.x.toFixed(1)}, ${entity.position.y.toFixed(1)}`
                                : 'Position not available yet'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerSidebar;
