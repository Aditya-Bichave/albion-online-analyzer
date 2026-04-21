import { useMemo } from 'react';

const MAX_ROUTE_NODES = 8;
const MAX_SEARCH_DISTANCE = 400; // Do not path to nodes further than this from current end point

export const useBestFarmingRoute = (nodes, playerPos, weights) => {
    return useMemo(() => {
        if (!nodes || nodes.length === 0 || !playerPos) return { path: [], totalValue: 0, distance: 0 };

        const path = [];
        let totalValue = 0;
        let totalDistance = 0;
        let currentPos = { x: Number(playerPos.x), y: Number(playerPos.y) };
        const availableNodes = new Set(nodes);

        for (let step = 0; step < MAX_ROUTE_NODES; step++) {
            if (availableNodes.size === 0) break;

            let bestNode = null;
            let bestScore = -Infinity;
            let distanceToBest = 0;

            for (const candidate of availableNodes) {
                const dist = Math.hypot(Number(candidate.x) - currentPos.x, Number(candidate.y) - currentPos.y);

                if (dist > MAX_SEARCH_DISTANCE && step > 0) continue;

                // Basic scoring: value - penalty for distance
                // We use routeScore calculated earlier, and dynamically apply distance penalty
                const baseScore = candidate.routeScore || 0;

                // The further away, the worse. We scale distance penalty by weight.
                const distPenalty = dist * (weights.distancePenalty || 1);

                const stepScore = baseScore - distPenalty;

                if (stepScore > bestScore) {
                    bestScore = stepScore;
                    bestNode = candidate;
                    distanceToBest = dist;
                }
            }

            if (!bestNode) break; // No reachable node found

            path.push(bestNode);
            totalValue += (bestNode.value || 0);
            totalDistance += distanceToBest;
            currentPos = { x: Number(bestNode.x), y: Number(bestNode.y) };
            availableNodes.delete(bestNode);
        }

        return {
            path,
            totalValue,
            distance: totalDistance
        };
    }, [nodes, playerPos, weights]);
};
