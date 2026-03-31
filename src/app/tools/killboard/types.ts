export interface Event {
  EventId: number;
  TimeStamp: string;
  Killer: PlayerInfo;
  Victim: PlayerInfo;
  TotalVictimKillFame: number;
  Participants: Participant[];
}

export interface PlayerInfo {
  Name: string;
  Id: string;
  GuildName: string;
  AllianceName: string;
  AverageItemPower: number;
  Equipment: Equipment;
  Inventory: (Item | null)[];
}

export interface Equipment {
  MainHand: Item | null;
  OffHand: Item | null;
  Head: Item | null;
  Armor: Item | null;
  Shoes: Item | null;
  Bag: Item | null;
  Cape: Item | null;
  Mount: Item | null;
  Potion: Item | null;
  Food: Item | null;
}

export interface Item {
  Type: string;
  Count: number;
  Quality: number;
}

export interface Participant {
  Name: string;
  Id: string;
  GuildName: string;
  AverageItemPower: number;
  DamageDone: number;
  SupportHealingDone: number;
  Equipment: Equipment;
}

export interface KillStats {
  totalKills: number;
  totalFame: number;
  dailyAverage: number;
  killFame: number;
  deathFame: number;
  kdRatio: number;
}

export interface ActivityData {
  timestamp: string;
  kills: number;
  fame: number;
}

export type TimeFilter = 'all' | '12h' | '24h' | '7d' | '30d';
export type ViewMode = 'live' | 'history';
