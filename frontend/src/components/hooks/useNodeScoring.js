import { useMemo } from 'react';
import { enrichNodeEconomy } from '../../utils/economyValueAdapter';
import { calculateNodeScore } from '../../utils/mapScoringUtils';

export const useNodeScoring = (nodes, activePresetConfig) => {
    return useMemo(() => {
        if (!nodes || nodes.length === 0) return { scoredNodes: [], minVal: 0, maxVal: 0, minSpm: 0, maxSpm: 0 };

        let minVal = Infinity;
        let maxVal = -Infinity;
        let minSpm = Infinity;
        let maxSpm = -Infinity;

        const scoredNodes = nodes.map(node => {
            const enriched = enrichNodeEconomy(node);

            if (enriched.value < minVal) minVal = enriched.value;
            if (enriched.value > maxVal) maxVal = enriched.value;
            if (enriched.spm < minSpm) minSpm = enriched.spm;
            if (enriched.spm > maxSpm) maxSpm = enriched.spm;

            const score = calculateNodeScore(enriched, activePresetConfig.routeWeights);

            return {
                ...enriched,
                routeScore: score
            };
        });

        return {
            scoredNodes,
            minVal: minVal === Infinity ? 0 : minVal,
            maxVal: maxVal === -Infinity ? 0 : maxVal,
            minSpm: minSpm === Infinity ? 0 : minSpm,
            maxSpm: maxSpm === -Infinity ? 0 : maxSpm
        };
    }, [nodes, activePresetConfig]);
};
