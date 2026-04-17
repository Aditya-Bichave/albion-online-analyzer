import React, { useState, useEffect, useRef } from 'react';
import InteractiveMap from './components/InteractiveMap';
import ResourceSidebar from './components/ResourceSidebar';
import ConsoleLogger from './components/ConsoleLogger';
import ProfitTreeCalculator from './components/calculator/ProfitTreeCalculator';
import { createRendererLogger } from './logger';

function App() {
    const [nodes, setNodes] = useState([]);
    const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
    const [playerTrail, setPlayerTrail] = useState([{ x: 0, y: 0 }]);
    const [zoneInfo, setZoneInfo] = useState(null);
    const [statusMessage, setStatusMessage] = useState('Connecting to backend...');
    const [isConnected, setIsConnected] = useState(false);
    const [logs, setLogs] = useState([]);
    const [backendMode, setBackendMode] = useState('simulation');
    const [isSwitchingMode, setIsSwitchingMode] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        tiers: [1, 2, 3, 4, 5, 6, 7, 8],
        types: ['wood', 'ore', 'fiber', 'hide', 'stone'],
        minEnchant: 0
    });
    
    // UI State
    const [activeTab, setActiveTab] = useState('map');

    const ws = useRef(null);
    const reconnectTimer = useRef(null);
    const shouldReconnect = useRef(true);
    const lastLogSignature = useRef('');
    const rendererLogger = useRef(null);
    const rendererLogLevel = useRef(import.meta.env.VITE_LOG_LEVEL || 'info');
    const uiLogLevel = useRef(import.meta.env.VITE_LOG_UI_STREAM_LEVEL || 'info');
    const zoneInfoRef = useRef(null);

    const appendConsoleLog = ({ timestamp, source = 'app', level = 'info', event = 'log', text = '', context = null }) => {
        const logTime = timestamp ? new Date(timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
        const extraText = context ? ` // ${JSON.stringify(context)}` : '';
        setLogs(prev => [...prev, {
            time: logTime,
            source,
            level,
            event,
            text: `${text}${extraText}`.trim()
        }].slice(-300));
    };

    const formatLogText = (eventName, data) => {
        if (eventName === 'ALBION_DECODED') {
            return `${data?.name ?? 'Unknown'} (#${data?.code ?? '?'}) // keys=${Array.isArray(data?.keys) ? data.keys.join(',') : 'n/a'} // ${JSON.stringify(data?.parameters ?? {})}`;
        }

        if (eventName === 'SNIFFER_STATS') {
            return `packetsSeen=${data?.packetsSeen ?? 0}, nodes=${data?.trackedNodes ?? 0}, player=${data?.trackedPlayerName ?? 'unknown'}#${data?.trackedPlayerEntityId ?? 'n/a'}, decoder=${data?.decoder ?? 'unknown'}, filter=${data?.filter ?? 'n/a'}`;
        }

        if (eventName === 'SNIFFER_STATUS') {
            return `${data?.state ?? 'unknown'} // ${data?.message ?? 'No status message'}`;
        }

        if (eventName === 'SNIFFER_DEBUG') {
            const kind = data?.kind ?? 'unknown';
            const count = data?.count ?? '?';
            const details = JSON.stringify(data);
            return `${kind} #${count} // ${details}`;
        }

        if (eventName === 'MAP_RESET') {
            return data?.reason ? `Map reset // ${data.reason}` : 'Map reset';
        }

        const serialized = JSON.stringify(data);
        return serialized.length > 220 ? `${serialized.substring(0, 220)}...` : serialized;
    };

    useEffect(() => {
        rendererLogger.current = createRendererLogger({
            getSocket: () => ws.current,
            getMinimumLevel: () => rendererLogLevel.current,
            onLocalRecord: (record) => {
                appendConsoleLog({
                    timestamp: record.timestamp,
                    source: 'frontend',
                    level: record.level,
                    event: record.message,
                    text: JSON.stringify(record.context ?? {})
                });
            }
        });

        rendererLogger.current.info('renderer_logger_initialized', {
            logLevel: rendererLogLevel.current,
            uiLogLevel: uiLogLevel.current
        });

        return () => {
            rendererLogger.current = null;
        };
    }, []);

    const resetMapState = () => {
        setNodes([]);
        setPlayerPos({ x: 0, y: 0 });
        setPlayerTrail([{ x: 0, y: 0 }]);
        setZoneInfo(null);
        rendererLogger.current?.debug('map_state_reset', {
            reason: 'resetMapState_called'
        });
    };

    const requestModeChange = (nextMode) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN || nextMode === backendMode || isSwitchingMode) {
            return;
        }

        setIsSwitchingMode(true);
        setStatusMessage(`Switching to ${nextMode === 'sniffer' ? 'Live Mode' : 'Simulation Mode'}...`);
        rendererLogger.current?.info('mode_change_requested', {
            nextMode,
            currentMode: backendMode
        });
        resetMapState();
        ws.current.send(JSON.stringify({
            command: 'SET_MODE',
            data: { mode: nextMode }
        }));
    };

    useEffect(() => {
        shouldReconnect.current = true;

        const connectWebSocket = () => {
            if (!shouldReconnect.current) {
                return;
            }

            const socket = new WebSocket('ws://localhost:8080');
            ws.current = socket;

            socket.onopen = () => {
                if (reconnectTimer.current) {
                    clearTimeout(reconnectTimer.current);
                    reconnectTimer.current = null;
                }

                setIsConnected(true);
                setStatusMessage('Connected to Radar System');
                rendererLogger.current?.info('websocket_open', {
                    url: 'ws://localhost:8080'
                });
                rendererLogger.current?.flush();
            };

            socket.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.event === 'APP_LOG') {
                        appendConsoleLog({
                            timestamp: msg.data?.timestamp,
                            source: msg.data?.source || 'backend',
                            level: msg.data?.level || 'info',
                            event: msg.data?.event || 'APP_LOG',
                            text: JSON.stringify(msg.data?.context ?? {})
                        });
                        return;
                    }

                    rendererLogger.current?.debug('backend_event_received', {
                        event: msg.event,
                        payloadSummary: Array.isArray(msg.data)
                            ? `[array:${msg.data.length}]`
                            : Object.keys(msg.data || {})
                    });
                    const logText = formatLogText(msg.event, msg.data);
                    const signature = `${msg.event}::${logText}`;

                    if (lastLogSignature.current !== signature) {
                        lastLogSignature.current = signature;
                        setLogs(prev => [...prev, {
                            time: new Date().toLocaleTimeString(),
                            source: 'backend-event',
                            level: 'info',
                            event: msg.event,
                            text: logText
                        }].slice(-300));
                    }
                    
                    switch (msg.event) {
                        case 'CONNECTED':
                            setIsConnected(true);
                            setStatusMessage(msg.data.message);
                            setBackendMode(msg.data.mode || 'simulation');
                            uiLogLevel.current = msg.data.logUiStreamLevel || uiLogLevel.current;
                            rendererLogger.current?.info('backend_connected', {
                                mode: msg.data.mode,
                                sessionId: msg.data.sessionId,
                                logUiStreamLevel: uiLogLevel.current,
                                packetVerbose: msg.data.packetVerbose
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'STATE_SNAPSHOT':
                            if (msg.data?.mode) {
                                setBackendMode(msg.data.mode);
                            }
                            setZoneInfo(msg.data?.zoneInfo ?? null);
                            setNodes(Array.isArray(msg.data?.nodes) ? msg.data.nodes : []);
                            if (msg.data?.playerPos && Number.isFinite(msg.data.playerPos.x) && Number.isFinite(msg.data.playerPos.y)) {
                                setPlayerPos(msg.data.playerPos);
                                setPlayerTrail([{ x: msg.data.playerPos.x, y: msg.data.playerPos.y }]);
                            } else {
                                setPlayerPos({ x: 0, y: 0 });
                                setPlayerTrail([{ x: 0, y: 0 }]);
                            }
                            rendererLogger.current?.info('state_snapshot_applied', {
                                mode: msg.data?.mode,
                                zoneInfo: msg.data?.zoneInfo ?? null,
                                nodeCount: Array.isArray(msg.data?.nodes) ? msg.data.nodes.length : 0,
                                playerPos: msg.data?.playerPos ?? null
                            });
                            break;
                        case 'ZONE_ENTER':
                            {
                                const previousZone = zoneInfoRef.current;
                                const nextZone = msg.data ?? null;
                                const zoneChanged = !previousZone
                                    || previousZone.zoneId !== nextZone?.zoneId
                                    || previousZone.name !== nextZone?.name;
                                setZoneInfo(nextZone);

                                if (zoneChanged) {
                                    rendererLogger.current?.warning('zone_enter_reset_applied', {
                                        previousZone,
                                        nextZone
                                    });
                                    setNodes([]);
                                    setPlayerPos({ x: 0, y: 0 });
                                    setPlayerTrail([{ x: 0, y: 0 }]);
                                } else {
                                    rendererLogger.current?.debug('zone_enter_duplicate_ignored', {
                                        zoneInfo: nextZone
                                    });
                                }
                            }
                            break;
                        case 'NEW_NODE':
                            setNodes(prev => {
                                const existingIndex = prev.findIndex(n => n.id === msg.data.id);
                                if (existingIndex === -1) {
                                    return [...prev, msg.data];
                                }

                                const next = [...prev];
                                next[existingIndex] = msg.data;
                                return next;
                            });
                            break;
                        case 'REMOVE_NODE':
                            setNodes(prev => prev.filter(node => node.id !== msg.data.id));
                            break;
                        case 'PLAYER_MOVE':
                            setPlayerPos({ x: msg.data.x, y: msg.data.y });
                            setPlayerTrail(prev => {
                                const lastPoint = prev[prev.length - 1];
                                if (lastPoint && lastPoint.x === msg.data.x && lastPoint.y === msg.data.y) {
                                    return prev;
                                }

                                return [...prev, { x: msg.data.x, y: msg.data.y }].slice(-18);
                            });
                            break;
                        case 'MODE_CHANGED':
                            setBackendMode(msg.data.mode || 'simulation');
                            setStatusMessage(msg.data.message || 'Mode changed');
                            rendererLogger.current?.info('mode_changed', {
                                mode: msg.data.mode,
                                message: msg.data.message
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'MODE_SWITCH_ACK':
                            setBackendMode(msg.data.mode || 'simulation');
                            setStatusMessage(msg.data.message || 'Mode switched');
                            rendererLogger.current?.info('mode_switch_ack', {
                                mode: msg.data.mode,
                                message: msg.data.message
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'MODE_SWITCH_ERROR':
                            setBackendMode(msg.data.mode || 'simulation');
                            setStatusMessage(msg.data.message || 'Failed to switch mode');
                            rendererLogger.current?.error('mode_switch_error', {
                                mode: msg.data.mode,
                                message: msg.data.message
                            });
                            setIsSwitchingMode(false);
                            break;
                        case 'MAP_RESET':
                            resetMapState();
                            setStatusMessage(msg.data?.reason ? `Map reset: ${msg.data.reason}` : 'Map reset');
                            rendererLogger.current?.warning('map_reset_received', {
                                reason: msg.data?.reason ?? null
                            });
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    rendererLogger.current?.error('websocket_message_parse_failed', {
                        error: error.message,
                        raw: event.data
                    });
                }
            };

            socket.onerror = (error) => {
                rendererLogger.current?.error('websocket_error', {
                    message: error?.message ?? 'WebSocket error'
                });
            };

            socket.onclose = () => {
                ws.current = null;
                setIsConnected(false);
                setIsSwitchingMode(false);
                setStatusMessage('Disconnected from backend - reconnecting...');
                rendererLogger.current?.warning('websocket_closed', {
                    willReconnect: shouldReconnect.current
                });

                if (shouldReconnect.current) {
                    reconnectTimer.current = setTimeout(connectWebSocket, 1500);
                }
            };
        };

        connectWebSocket();

        return () => {
            shouldReconnect.current = false;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
            rendererLogger.current?.info('app_cleanup', { reason: 'component_unmount' });
            if (ws.current) ws.current.close();
        };
    }, []);

    useEffect(() => {
        zoneInfoRef.current = zoneInfo;
        rendererLogger.current?.debug('zone_state_changed', {
            zoneInfo
        });
    }, [zoneInfo]);

    useEffect(() => {
        rendererLogger.current?.debug('node_count_changed', {
            count: nodes.length
        });
    }, [nodes.length]);

    useEffect(() => {
        rendererLogger.current?.debug('player_position_changed', {
            x: playerPos.x,
            y: playerPos.y
        });
    }, [playerPos.x, playerPos.y]);

    useEffect(() => {
        rendererLogger.current?.info('backend_mode_state_changed', {
            backendMode
        });
    }, [backendMode]);

    useEffect(() => {
        rendererLogger.current?.debug('mode_switch_state_changed', {
            isSwitchingMode
        });
    }, [isSwitchingMode]);

    const filteredNodes = nodes.filter(n => 
        filters.tiers.includes(n.tier) &&
        filters.types.includes(n.type) &&
        n.enchant >= filters.minEnchant
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            
            {/* Top Navigation Bar */}
            <div style={{
                height: '48px', minHeight: '48px', background: 'rgba(0,0,0,0.8)', borderBottom: '1px solid var(--border-active)',
                display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', zIndex: 50
            }}>
                <div style={{ fontWeight: '900', marginRight: 'auto', color: 'var(--accent-cyan)', letterSpacing: '1px' }}>ALBION RADAR</div>
                <div style={{
                    padding: '5px 10px',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: backendMode === 'sniffer' ? '#081014' : '#25130a',
                    background: backendMode === 'sniffer' ? 'rgba(34, 211, 238, 0.9)' : 'rgba(251, 191, 36, 0.9)'
                }}>
                    {backendMode === 'sniffer' ? 'Live Mode' : 'Simulation Mode'}
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-subtle)'
                }}>
                    {[
                        { key: 'simulation', label: 'Simulation' },
                        { key: 'sniffer', label: 'Live' }
                    ].map(option => {
                        const active = backendMode === option.key;
                        return (
                            <button
                                key={option.key}
                                onClick={() => requestModeChange(option.key)}
                                disabled={isSwitchingMode || active}
                                style={{
                                    background: active ? 'rgba(34, 211, 238, 0.18)' : 'transparent',
                                    border: 'none',
                                    color: active ? '#fff' : 'var(--text-secondary)',
                                    opacity: isSwitchingMode && !active ? 0.6 : 1,
                                    padding: '6px 14px',
                                    borderRadius: '999px',
                                    cursor: isSwitchingMode || active ? 'default' : 'pointer',
                                    fontWeight: 700,
                                    fontSize: '0.78rem'
                                }}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => setActiveTab('map')}
                    style={{
                        background: activeTab === 'map' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none', color: activeTab === 'map' ? '#fff' : 'var(--text-secondary)', 
                        padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                    }}
                >
                    Live Map
                </button>
                <button
                    onClick={() => setActiveTab('console')}
                    style={{
                        background: activeTab === 'console' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none', color: activeTab === 'console' ? '#fff' : 'var(--text-secondary)', 
                        padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                    }}
                >
                    Network Console
                </button>
                <button
                    onClick={() => setActiveTab('calculator')}
                    style={{
                        background: activeTab === 'calculator' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none', color: activeTab === 'calculator' ? '#fff' : 'var(--text-secondary)',
                        padding: '6px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600
                    }}
                >
                    Profit Calculator
                </button>
            </div>

            {/* Main Application Body */}
            <div style={{ display: 'flex', flex: 1, zIndex: 1, overflow: 'hidden' }}>
                {activeTab === 'map' ? (
                    <>
                        {/* Left Sidebar overlaying the map slightly if wanted, or side-by-side */}
                        <div style={{ zIndex: 10 }}>
                            <ResourceSidebar 
                                nodes={nodes} 
                                filters={filters} 
                                setFilters={setFilters} 
                            />
                        </div>
                        
                        {/* Map renders underneath but occupies the whole space practically */}
                        <InteractiveMap
                            nodes={filteredNodes}
                            playerPos={playerPos}
                            playerTrail={playerTrail}
                            zoneInfo={zoneInfo}
                        />
                    </>
                ) : activeTab === 'console' ? (
                    <div style={{ flex: 1, display: 'flex', background: '#090a0d', padding: '24px', justifyContent: 'center' }}>
                        <div style={{ width: '100%', maxWidth: '1200px' }}>
                            <ConsoleLogger logs={logs} />
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', background: '#090a0d', overflow: 'hidden' }}>
                        <div style={{ width: '100%', height: '100%' }}>
                            <ProfitTreeCalculator />
                        </div>
                    </div>
                )}
            </div>

            {/* Global Status Bar */}
            <div style={{
                position: 'fixed', bottom: 0, left: 0, right: 0,
                height: '32px', background: 'rgba(0,0,0,0.8)',
                borderTop: '1px solid var(--border-active)',
                display: 'flex', alignItems: 'center', padding: '0 24px',
                zIndex: 20, fontSize: '0.8rem', color: 'var(--text-secondary)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: isConnected ? 'var(--accent-cyan)' : 'var(--res-ore)'
                    }}/>
                    <span>{statusMessage}</span>
                </div>
            </div>
        </div>
    );
}

export default App;
