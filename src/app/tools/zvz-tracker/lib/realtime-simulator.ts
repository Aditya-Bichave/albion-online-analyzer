/**
 * Simulates real-time updates for development/testing
 * In production, this would be replaced with actual WebSocket connections
 */

import type { Battle } from '../types';

export function simulateBattleUpdates(
  battles: Battle[],
  callback: (updatedBattles: Battle[]) => void
) {
  // Randomly update battle stats every 5-10 seconds
  const interval = setInterval(() => {
    const updatedBattles = battles.map(battle => {
      // Only update live battles (started within last 20 minutes)
      const isLive = new Date(battle.startTime).getTime() > Date.now() - 20 * 60 * 1000;
      
      if (!isLive) return battle;
      
      // Randomly add 0-3 kills and corresponding fame
      const newKills = Math.floor(Math.random() * 4);
      const newFame = newKills * (1000 + Math.floor(Math.random() * 5000));
      
      return {
        ...battle,
        totalKills: battle.totalKills + newKills,
        totalFame: battle.totalFame + newFame
      };
    });
    
    callback(updatedBattles);
  }, 5000 + Math.random() * 5000);
  
  return () => clearInterval(interval);
}
