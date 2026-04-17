import { useMemo } from 'react';

const HOTSPOT_DISTANCE_THRESHOLD = 150; // Map units to consider nodes in the same cluster

export const useHotspotDetection = (nodes, playerPos) => {
    return useMemo(() => {
        if (!nodes || nodes.length === 0) return [];

        const clusters = [];
        const unassigned = [...nodes];

        while (unassigned.length > 0) {
            const current = unassigned.pop();
            const cluster = [current];

            let added;
            do {
                added = false;
                for (let i = unassigned.length - 1; i >= 0; i--) {
                    const candidate = unassigned[i];
                    // Check distance to any node in the current cluster
                    for (const member of cluster) {
                        const dist = Math.hypot(candidate.x - member.x, candidate.y - member.y);
                        if (dist <= HOTSPOT_DISTANCE_THRESHOLD) {
                            cluster.push(candidate);
                            unassigned.splice(i, 1);
                            added = true;
                            break; // Break inner loop, go to next candidate check
                        }
                    }
                }
            } while (added);

            if (cluster.length >= 3) { // Only consider 3+ nodes a hotspot
                clusters.push(cluster);
            }
        }

        const hotspots = clusters.map((clusterNodes, index) => {
            let totalX = 0;
            let totalY = 0;
            let totalValue = 0;
            let totalTier = 0;
            let totalEnchant = 0;

            const typeCounts = {};

            clusterNodes.forEach(n => {
                totalX += Number(n.x);
                totalY += Number(n.y);
                totalValue += (n.value || 0);
                totalTier += n.tier;
                totalEnchant += n.enchant;

                typeCounts[n.type] = (typeCounts[n.type] || 0) + 1;
            });

            const count = clusterNodes.length;
            const centerX = totalX / count;
            const centerY = totalY / count;

            // Find dominant type
            let dominantType = Object.keys(typeCounts)[0];
            let maxCount = 0;
            for (const [type, tCount] of Object.entries(typeCounts)) {
                if (tCount > maxCount) {
                    dominantType = type;
                    maxCount = tCount;
                }
            }

            const playerDist = playerPos ? Math.hypot(centerX - playerPos.x, centerY - playerPos.y) : 0;

            const densityScore = count * (totalValue / count);

            return {
                id: `hotspot-${index}`,
                x: centerX,
                y: centerY,
                nodes: clusterNodes,
                nodeCount: count,
                totalValue,
                averageTier: (totalTier / count).toFixed(1),
                averageEnchant: (totalEnchant / count).toFixed(1),
                dominantType,
                distance: playerDist,
                score: densityScore
            };
        });

        // Sort by score descending
        return hotspots.sort((a, b) => b.score - a.score);
    }, [nodes, playerPos]);
};
