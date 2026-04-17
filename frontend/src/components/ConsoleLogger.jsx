import React, { useEffect, useRef } from 'react';

const ConsoleLogger = ({ logs }) => {
    const endRef = useRef(null);
    const levelBorder = {
        verbose: 'rgba(148, 163, 184, 0.65)',
        debug: 'rgba(34, 211, 238, 0.85)',
        info: 'rgba(74, 222, 128, 0.85)',
        warning: 'rgba(251, 191, 36, 0.9)',
        error: 'rgba(239, 68, 68, 0.95)'
    };

    useEffect(() => {
        if (endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    return (
        <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '1200px',
            height: '100%',
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderRight: 'none',
            borderLeft: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(15, 17, 21, 0.85)'
        }}>
            <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, paddingBottom: '12px', borderBottom: '1px solid var(--border-active)' }}>
                    NETWORK CONSOLE
                </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem', fontFamily: '"Space Mono", monospace' }}>
                {logs.length === 0 && (
                    <div style={{ color: 'var(--text-secondary)' }}>Awaiting network packets...</div>
                )}
                {logs.map((log, index) => (
                    <div key={index} style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '8px',
                        borderRadius: '4px',
                        borderLeft: `2px solid ${levelBorder[log.level] || 'var(--accent-cyan)'}`
                    }}>
                        <span style={{ color: 'var(--accent-purple)', fontSize: '0.7rem', marginBottom: '4px' }}>
                            [{log.time}] [{(log.level || 'info').toUpperCase()}] [{log.source || 'app'}] {log.event}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{log.text}</span>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};

export default ConsoleLogger;
