import React, { useMemo, useState } from 'react';
import { getWorldEntityColor, getWorldEntityImageCandidates } from '../utils';

const WorldEntityAvatar = ({ entity, size = 28 }) => {
    const candidates = useMemo(() => getWorldEntityImageCandidates(entity), [entity]);
    const [candidateIndex, setCandidateIndex] = useState(0);

    const currentSrc = candidates[candidateIndex] || null;
    const borderColor = getWorldEntityColor(entity);

    if (!currentSrc) {
        return (
            <div style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '10px',
                border: `1px solid ${borderColor}66`,
                background: `${borderColor}22`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: borderColor,
                fontSize: `${Math.max(12, size * 0.45)}px`,
                fontWeight: 800
            }}>
                {entity?.kind?.slice(0, 1)?.toUpperCase() || '?'}
            </div>
        );
    }

    return (
        <img
            src={currentSrc}
            alt={entity?.label || entity?.kind || 'entity'}
            width={size}
            height={size}
            onError={() => {
                if (candidateIndex < candidates.length - 1) {
                    setCandidateIndex(candidateIndex + 1);
                }
            }}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                objectFit: 'cover',
                borderRadius: '10px',
                border: `1px solid ${borderColor}55`,
                background: 'rgba(4, 8, 14, 0.92)'
            }}
        />
    );
};

export default WorldEntityAvatar;
