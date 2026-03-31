// Albion Online Weapons Database - 2026 Meta
// Last Updated: March 2026 (Realm Divided Update)
// Covers all 20 weapon trees across 3 archetypes

export interface WeaponAbility {
  key: 'Q' | 'W' | 'E';
  name: string;
  description: string;
  cooldown?: number;
  energyCost?: number;
}

export interface WeaponRotation {
  name: string;
  steps: string[];
  tips: string[];
}

export interface Weapon {
  id: string;
  name: string;
  category: 'melee' | 'ranged' | 'staff' | 'hybrid';
  type: string;
  tier: string;
  difficulty: 'easy' | 'medium' | 'hard';
  role: string[];
  abilities: WeaponAbility[];
  rotation: WeaponRotation;
  stats: {
    burstDamage: number;
    sustainedDamage: number;
    mobility: number;
    survivability: number;
    range: number;
  };
  bestFor: string[];
  counters: string[];
  weakAgainst: string[];
  gearRecommendations: {
    armor?: string;
    shoes?: string;
    cape?: string;
    food?: string;
    potion?: string;
  };
  metaRating: 'S' | 'A' | 'B' | 'C';
  lastUpdated: string;
}

export const WEAPONS_DATABASE: Weapon[] = [
  // === MELEE WEAPONS ===
  {
    id: 'battleaxe',
    name: 'Battle Axe',
    category: 'melee',
    type: 'Two-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'easy',
    role: ['Solo PvP', 'Small Scale', 'Sustained DPS'],
    abilities: [
      { key: 'Q', name: 'Cleave', description: 'Deal damage in a cone, hitting multiple enemies', cooldown: 0.8 },
      { key: 'W', name: 'Rending Strike', description: 'Reduce enemy armor and deal damage', cooldown: 0.5 },
      { key: 'E', name: 'Terror Cry', description: 'Fear nearby enemies and gain damage buff', cooldown: 1.0 }
    ],
    rotation: {
      name: 'Standard Combo',
      steps: [
        'Activate E (Terror Cry) for damage buff',
        'Use W (Rending Strike) to reduce armor',
        'Auto-attack to build passive stacks',
        'Use Q (Cleave) for AoE damage',
        'Repeat W on cooldown for armor shred',
        'Weave auto-attacks between abilities'
      ],
      tips: [
        'Use E before engaging for maximum burst',
        'W reduces armor by up to 30% - crucial for extended fights',
        'Passive heals you based on damage dealt',
        'Strong duelist with good sustain'
      ]
    },
    stats: { burstDamage: 75, sustainedDamage: 85, mobility: 40, survivability: 70, range: 15 },
    bestFor: ['1v1 Duels', 'Small Scale PvP', 'Open World', 'Hellgates'],
    counters: ['Squishy ranged', 'Low armor targets'],
    weakAgainst: ['Kiting classes', 'High mobility weapons'],
    gearRecommendations: {
      armor: 'Mercenary Jacket / Fighter Jacket',
      shoes: 'Soldier Boots',
      cape: 'Thetford Cape / Undead Cape',
      food: 'Beef Stew / Pork Omelette',
      potion: 'Health Potion'
    },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'dagger',
    name: 'Dagger',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Solo PvP', 'Ganking', 'High Mobility'],
    abilities: [
      { key: 'Q', name: 'Assassinate', description: 'Dash to target and deal damage', cooldown: 0.6 },
      { key: 'W', name: 'Evasive Strike', description: 'Dash backward and deal damage', cooldown: 0.8 },
      { key: 'E', name: 'Shadow Slash', description: 'Deal damage and slow enemies', cooldown: 1.0 }
    ],
    rotation: {
      name: 'Burst Combo',
      steps: [
        'Open with Q (Assassinate) to engage',
        'Use E (Shadow Slash) for slow and damage',
        'Auto-attack while E slow is active',
        'Use W (Evasive Strike) to disengage or dodge',
        'Repeat Q when available for gap close',
        'Kite with auto-attacks between cooldowns'
      ],
      tips: [
        'Save W for dodging key enemy abilities',
        'E applies 30% slow - use to kite',
        'High energy cost - manage carefully',
        'Strong against ranged, weak vs tanks',
        'Pair with Assassin Jacket for ganking'
      ]
    },
    stats: { burstDamage: 90, sustainedDamage: 60, mobility: 95, survivability: 40, range: 15 },
    bestFor: ['Solo PvP', 'Ganking', 'Hit & Run', 'Open World'],
    counters: ['Mages', 'Bows', 'Immobile targets'],
    weakAgainst: ['Tanks', 'CC-heavy compositions'],
    gearRecommendations: {
      armor: 'Assassin Jacket / Stalker Hood',
      shoes: 'Assassin Shoes',
      cape: 'Thetford Cape / Undead Cape',
      food: 'Beef Stew / Fish',
      potion: 'Health Potion / Invisibility Potion'
    },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'sword',
    name: 'Sword',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'easy',
    role: ['All-rounder', 'Beginner Friendly', 'Small Scale'],
    abilities: [
      { key: 'Q', name: 'Slash', description: 'Deal damage in a line', cooldown: 0.5 },
      { key: 'W', name: 'Deadly Spin', description: 'Spin and deal AoE damage', cooldown: 0.8 },
      { key: 'E', name: 'Crescent Swipe', description: 'Dash and deal damage with slow', cooldown: 1.0 }
    ],
    rotation: {
      name: 'Balanced Combo',
      steps: [
        'Use E (Crescent Swipe) to engage',
        'Auto-attack while slow is active',
        'Use W (Deadly Spin) for AoE damage',
        'Use Q (Slash) between auto-attacks',
        'Repeat rotation',
        'Use E to disengage if needed'
      ],
      tips: [
        'Balanced stats - perfect for beginners',
        'E provides gap close and escape',
        'Good sustain with passive heal',
        'Versatile for most content',
        'Works well in any armor type'
      ]
    },
    stats: { burstDamage: 70, sustainedDamage: 75, mobility: 60, survivability: 65, range: 15 },
    bestFor: ['Beginners', 'Solo Content', 'Small Scale', 'Learning PvP'],
    counters: ['Other melee', 'Balanced compositions'],
    weakAgainst: ['High burst', 'Heavy kiting'],
    gearRecommendations: {
      armor: 'Knight Armor / Mercenary Jacket',
      shoes: 'Soldier Boots',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  {
    id: 'heron-spear',
    name: 'Heron Spear',
    category: 'melee',
    type: 'Two-Handed Melee',
    tier: 'T4-T8',
    difficulty: 'medium',
    role: ['Solo PvP', 'Beginner PvP', 'Sustain'],
    abilities: [
      { key: 'Q', name: 'Piercing Lance', description: 'Long range poke damage', cooldown: 0.6 },
      { key: 'W', name: 'Spear Throw', description: 'Throw spear and slow enemy', cooldown: 0.8 },
      { key: 'E', name: 'Leap', description: 'Jump to target and deal damage', cooldown: 1.2 }
    ],
    rotation: {
      name: 'Poke & Engage',
      steps: [
        'Poke with Q from max range',
        'Use W to slow if enemy engages',
        'When enemy is low, E to finish',
        'Auto-attack between abilities',
        'Use terrain to your advantage',
        'Disengage with W slow if needed'
      ],
      tips: [
        'Excellent range for a melee weapon',
        'W slow is crucial for kiting',
        'Passive heals on every 3rd attack',
        'Great beginner PvP weapon',
        'Strong in open world 1v1s'
      ]
    },
    stats: { burstDamage: 65, sustainedDamage: 70, mobility: 50, survivability: 75, range: 25 },
    bestFor: ['Beginner PvP', 'Open World', 'Solo Dungeons', 'Learning Mechanics'],
    counters: ['Melee without gap closer', 'Immobile targets'],
    weakAgainst: ['High burst', 'Ranged weapons'],
    gearRecommendations: {
      armor: 'Mercenary Jacket',
      shoes: 'Soldier Boots',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'quarterstaff',
    name: 'Quarterstaff',
    category: 'melee',
    type: 'Two-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Solo PvP', 'Small Scale', 'CC Chain'],
    abilities: [
      { key: 'Q', name: 'Swipe', description: 'AoE damage around you', cooldown: 0.5 },
      { key: 'W', name: 'Knock Down', description: 'Knock enemy down and stun', cooldown: 1.0 },
      { key: 'E', name: 'Overpower', description: 'Charge and stun target', cooldown: 1.2 }
    ],
    rotation: {
      name: 'CC Lock Combo',
      steps: [
        'Open with E (Overpower) to stun',
        'Auto-attack during stun',
        'Use W (Knock Down) as second CC',
        'Use Q (Swipe) while they\'re down',
        'Repeat when cooldowns available',
        'Chain CC for maximum control'
      ],
      tips: [
        'Long CC chain potential',
        'W knockdown lasts 1.5 seconds',
        'E is unblockable engage',
        'Strong against squishy targets',
        'Pair with CC reduction gear'
      ]
    },
    stats: { burstDamage: 70, sustainedDamage: 65, mobility: 45, survivability: 60, range: 20 },
    bestFor: ['Solo PvP', 'Small Scale', 'CC Compositions', 'Ganking'],
    counters: ['Squishy ranged', 'Low CC resistance'],
    weakAgainst: ['Tanks', 'CC reduction builds'],
    gearRecommendations: {
      armor: 'Mercenary Jacket / Knight Armor',
      shoes: 'Soldier Boots',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  // === RANGED WEAPONS ===
  {
    id: 'longbow',
    name: 'Longbow',
    category: 'ranged',
    type: 'Two-Handed Ranged',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Ranged DPS', 'Kiting', 'Solo PvP'],
    abilities: [
      { key: 'Q', name: 'Aimed Shot', description: 'High damage single target shot', cooldown: 1.0 },
      { key: 'W', name: 'Poison Arrow', description: 'Apply poison DoT and slow', cooldown: 0.8 },
      { key: 'E', name: 'Multi-Shot', description: 'AoE damage with knockback', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Kiting Combo',
      steps: [
        'Open with W (Poison Arrow) for DoT',
        'Auto-attack while poison ticks',
        'Use Q (Aimed Shot) for burst',
        'Use E (Multi-Shot) if enemy engages',
        'Kite backward while auto-attacking',
        'Reapply W when poison expires'
      ],
      tips: [
        'W applies poison - stack for max damage',
        'E is your only defensive tool - use wisely',
        'Strong kiting potential',
        'Good against melee classes',
        'Maintain maximum range at all times'
      ]
    },
    stats: { burstDamage: 80, sustainedDamage: 70, mobility: 50, survivability: 35, range: 35 },
    bestFor: ['Solo PvP', 'Kiting', 'Open World', 'Small Scale'],
    counters: ['Melee without gap closer', 'Immobile targets'],
    weakAgainst: ['Assassins', 'High mobility weapons'],
    gearRecommendations: {
      armor: 'Stalker Hood / Assassin Jacket',
      shoes: 'Assassin Shoes',
      cape: 'Thetford Cape',
      food: 'Beef Stew / Fish',
      potion: 'Health Potion'
    },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'crossbow',
    name: 'Crossbow',
    category: 'ranged',
    type: 'Two-Handed Ranged',
    tier: 'T3-T8',
    difficulty: 'hard',
    role: ['Ranged DPS', 'Burst', 'Positioning Heavy'],
    abilities: [
      { key: 'Q', name: 'Bolt Shot', description: 'Quick damage shot', cooldown: 0.4 },
      { key: 'W', name: 'Snipe', description: 'Long range high damage shot', cooldown: 1.5 },
      { key: 'E', name: 'Escape', description: 'Jump backward and gain speed', cooldown: 1.8 }
    ],
    rotation: {
      name: 'Burst Combo',
      steps: [
        'Position at maximum range',
        'Use W (Snipe) for opening burst',
        'Auto-attack while W cooldown',
        'Use Q (Bolt Shot) between autos',
        'Use E (Escape) if enemy engages',
        'Reposition and repeat'
      ],
      tips: [
        'Highest single target burst',
        'E is crucial for survival',
        'Positioning is everything',
        'Weak if caught out of position',
        'Pair with escape abilities'
      ]
    },
    stats: { burstDamage: 95, sustainedDamage: 60, mobility: 40, survivability: 30, range: 35 },
    bestFor: ['Organized PvP', 'Ranged DPS Role', 'Backline Damage'],
    counters: ['Immobile targets', 'Low armor targets'],
    weakAgainst: ['Assassins', 'Dive compositions'],
    gearRecommendations: {
      armor: 'Stalker Hood',
      shoes: 'Assassin Shoes',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  // === STAFF WEAPONS ===
  {
    id: 'fire-staff',
    name: 'Fire Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'hard',
    role: ['Ranged DPS', 'Burst Mage', 'ZvZ'],
    abilities: [
      { key: 'Q', name: 'Flamestrike', description: 'AoE fire damage', cooldown: 1.0 },
      { key: 'W', name: 'Fireball', description: 'Long range poke damage', cooldown: 0.8 },
      { key: 'E', name: 'Immolate', description: 'Self-buff and damage over time', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Burst Mage Combo',
      steps: [
        'Activate E (Immolate) for damage buff',
        'Use W (Fireball) from long range',
        'Use Q (Flamestrike) for AoE',
        'Auto-attack between cooldowns',
        'Reposition with E if needed',
        'Repeat rotation'
      ],
      tips: [
        'Very squishy - position carefully',
        'High burst combo: E → W → Q',
        'Kite with W while moving',
        'Weak against melee engage',
        'Essential for ZvZ compositions'
      ]
    },
    stats: { burstDamage: 95, sustainedDamage: 85, mobility: 30, survivability: 25, range: 30 },
    bestFor: ['Group PvP', 'ZvZ', 'Ranged DPS', 'Organized Fights'],
    counters: ['Squishy targets', 'Grouped enemies'],
    weakAgainst: ['Melee engage', 'Assassins'],
    gearRecommendations: {
      armor: 'Scholar Robe / Cleric Robe',
      shoes: 'Scholar Sandals',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Mana Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  {
    id: 'infernal-scyythe',
    name: 'Infernal Scythe',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T4-T8',
    difficulty: 'medium',
    role: ['ZvZ Meta', 'AoE Damage', 'CC'],
    abilities: [
      { key: 'Q', name: 'Soul Scythe', description: 'AoE damage and slow', cooldown: 0.8 },
      { key: 'W', name: 'Wisp', description: 'Summon wisp for damage', cooldown: 1.0 },
      { key: 'E', name: 'Reaping Slash', description: 'AoE damage and root', cooldown: 1.5 }
    ],
    rotation: {
      name: 'ZvZ Combo',
      steps: [
        'Pre-stack Q before engaging',
        'Use E (Reaping Slash) to root targets',
        'Use Q for AoE damage and slow',
        'Activate W for additional damage',
        'Reposition with team',
        'Repeat Q and E on cooldown'
      ],
      tips: [
        'Backbone of every ZvZ composition',
        'Massive AoE damage and CC',
        'Pre-stacking Q is crucial',
        'Stay with your team',
        'Meta-defining weapon for 2026'
      ]
    },
    stats: { burstDamage: 85, sustainedDamage: 90, mobility: 35, survivability: 40, range: 25 },
    bestFor: ['ZvZ', 'Large Scale PvP', 'Group Fights', 'Territory Wars'],
    counters: ['Grouped enemies', 'Low mobility targets'],
    weakAgainst: ['Dive compositions', 'High mobility'],
    gearRecommendations: {
      armor: 'Scholar Robe',
      shoes: 'Scholar Sandals',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Mana Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  {
    id: 'nature-staff',
    name: 'Nature Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Healer', 'Support', 'Group Content'],
    abilities: [
      { key: 'Q', name: 'Wild Growth', description: 'AoE heal over time', cooldown: 1.0 },
      { key: 'W', name: 'Rejuvenating Seeds', description: 'HoT on target', cooldown: 0.8 },
      { key: 'E', name: 'Entangling Roots', description: 'CC and heal', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Healer Rotation',
      steps: [
        'Keep W (Seeds) on tank at all times',
        'Use Q (Wild Growth) for AoE healing',
        'Use E (Entangling Roots) for CC',
        'Auto-attack when not healing',
        'Prioritize W uptime on tanks',
        'Manage mana carefully'
      ],
      tips: [
        'Your job is to keep team alive',
        'E provides peel for squishies',
        'Position safely in backline',
        'Manage mana carefully',
        'Essential for group PvE'
      ]
    },
    stats: { burstDamage: 30, sustainedDamage: 40, mobility: 50, survivability: 50, range: 25 },
    bestFor: ['Group Content', 'Healer Role', 'ZvZ', 'Dungeons'],
    counters: ['N/A - Support Weapon'],
    weakAgainst: ['Dive compositions', 'Out of mana'],
    gearRecommendations: {
      armor: 'Cleric Robe / Scholar Robe',
      shoes: 'Scholar Sandals',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Mana Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  // === 2026 META WEAPONS ===
  {
    id: 'bloodletter',
    name: 'Bloodletter',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T4-T8',
    difficulty: 'hard',
    role: ['Solo PvP', 'Ganking', 'Execute Damage'],
    abilities: [
      { key: 'Q', name: 'Piercing Stab', description: 'Dash and deal damage', cooldown: 0.5 },
      { key: 'W', name: 'Lunging Stabs', description: 'Multiple dash attacks', cooldown: 0.8 },
      { key: 'E', name: 'Bloodlust', description: 'Execute low health targets', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Assassination Combo',
      steps: [
        'Chain Q into W for faster clears',
        'Use E to execute low health targets',
        'Auto-attack between abilities',
        'Use mobility to kite and chase',
        'Save escape abilities for safety',
        'Reset on kills with passive'
      ],
      tips: [
        'Unmatched mobility and execute damage',
        'Synergizes with Assassin Jacket',
        'Strong for ganking and hit-and-run',
        'Reset passive on kills is powerful',
        '2026 Solo PvP meta weapon'
      ]
    },
    stats: { burstDamage: 95, sustainedDamage: 70, mobility: 100, survivability: 35, range: 15 },
    bestFor: ['Solo PvP', 'Ganking', 'Hit & Run', 'Open World'],
    counters: ['Low health targets', 'Immobile enemies'],
    weakAgainst: ['Tanks', 'CC-heavy compositions'],
    gearRecommendations: {
      armor: 'Assassin Jacket',
      shoes: 'Assassin Shoes',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  {
    id: 'carving-sword',
    name: 'Carving Sword',
    category: 'melee',
    type: 'Two-Handed Melee',
    tier: 'T4-T8',
    difficulty: 'medium',
    role: ['ZvZ', 'Small Scale', 'Frontline'],
    abilities: [
      { key: 'Q', name: 'Slash', description: 'AoE damage', cooldown: 0.5 },
      { key: 'W', name: 'Wide Slash', description: 'Wider AoE damage', cooldown: 0.8 },
      { key: 'E', name: 'Spinning Blades', description: 'AoE damage and mobility', cooldown: 1.2 }
    ],
    rotation: {
      name: 'ZvZ Frontline',
      steps: [
        'Use E (Spinning Blades) to engage',
        'Use Q and W for AoE damage',
        'Stay with your frontline',
        'Focus priority targets',
        'Use mobility to reposition',
        'Repeat rotation'
      ],
      tips: [
        'Versatile with strong AoE and sustain',
        'ZvZ dominance in 2026 meta',
        'Strong frontline disruptor',
        'Good sustain with passive',
        'Meta-resilient weapon'
      ]
    },
    stats: { burstDamage: 75, sustainedDamage: 80, mobility: 55, survivability: 65, range: 20 },
    bestFor: ['ZvZ', 'Small Scale PvP', 'Hellgates', 'Group Fights'],
    counters: ['Grouped enemies', 'Low mobility targets'],
    weakAgainst: ['High burst', 'Kiting'],
    gearRecommendations: {
      armor: 'Mercenary Jacket / Knight Armor',
      shoes: 'Soldier Boots',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  // === TANK WEAPONS 2026 ===
  {
    id: 'incubus-mace',
    name: 'Incubus Mace',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T4-T8',
    difficulty: 'easy',
    role: ['Tank', 'Group PvE', 'Beginner Tank'],
    abilities: [
      { key: 'Q', name: 'Threatening Smash', description: 'AoE threat generation', cooldown: 0.8 },
      { key: 'W', name: 'Air Compressor', description: 'Pull enemies together', cooldown: 1.0 },
      { key: 'E', name: 'Shrinking Curse', description: 'Reduce enemy resistance', cooldown: 1.5 }
    ],
    rotation: {
      name: 'PvE Tank Rotation',
      steps: [
        'Use W (Air Compressor) to clump mobs',
        'Use Q (Threatening Smash) for threat',
        'Use E (Shrinking Curse) for resistance reduction',
        'Auto-attack between cooldowns',
        'Keep mobs grouped for your team',
        'Repeat rotation'
      ],
      tips: [
        'Reliable PvE standard for beginners',
        'Expected in Hardcore Expedition groups',
        'Synergizes with AoE damage dealers',
        'Easy to learn tank weapon',
        '2026 PvE meta tank weapon'
      ]
    },
    stats: { burstDamage: 40, sustainedDamage: 50, mobility: 30, survivability: 85, range: 15 },
    bestFor: ['Group PvE', 'Expeditions', 'World Bosses', 'Beginner Tanking'],
    counters: ['N/A - Tank Weapon'],
    weakAgainst: ['High mobility bosses', 'Spread compositions'],
    gearRecommendations: {
      armor: 'Guardian Armor / Knight Armor',
      shoes: 'Guardian Shoes',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'earthrune-staff',
    name: 'Earthrune Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T4-T8',
    difficulty: 'hard',
    role: ['Tank', 'ZvZ Engage', 'Transformation'],
    abilities: [
      { key: 'Q', name: 'Adapting Matter', description: 'Shield and shift charges', cooldown: 0.8 },
      { key: 'W', name: 'Polymorph', description: 'Transform enemy', cooldown: 1.5 },
      { key: 'E', name: 'Runestone Golem', description: 'Transform into golem', cooldown: 2.0 }
    ],
    rotation: {
      name: 'Engage Tank',
      steps: [
        'Use E (Golem Transformation) to engage',
        'Use W (Polymorph) on priority target',
        'Use Q for shield and damage',
        'Soak damage in Golem form',
        'Exit transformation safely',
        'Repeat when cooldowns available'
      ],
      tips: [
        'High-impact initiation tool',
        'Difficult to burst during Golem form',
        'ZvZ and Crystal Arena meta',
        'Requires good timing',
        '2026 engage tank meta'
      ]
    },
    stats: { burstDamage: 50, sustainedDamage: 55, mobility: 40, survivability: 95, range: 20 },
    bestFor: ['ZvZ', 'Crystal Arena', 'Organized PvP', 'Main Tank'],
    counters: ['Squishy backline', 'Low mobility compositions'],
    weakAgainst: ['Kiting', 'Purge compositions'],
    gearRecommendations: {
      armor: 'Guardian Armor',
      shoes: 'Guardian Shoes',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  {
    id: 'hand-of-justice',
    name: 'Hand of Justice',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T4-T8',
    difficulty: 'hard',
    role: ['Tank', 'ZvZ Engage', 'Initiator'],
    abilities: [
      { key: 'Q', name: 'Iron Breaker', description: 'Reduce resistance', cooldown: 0.8 },
      { key: 'W', name: 'Slowing Charge', description: 'Gap closer with slow', cooldown: 1.0 },
      { key: 'E', name: 'Onslaught', description: 'Pull and airborne', cooldown: 1.8 }
    ],
    rotation: {
      name: 'Primary Initiator',
      steps: [
        'Use W (Slowing Charge) to engage',
        'Use E (Onslaught) to pull targets',
        'Use Q (Iron Breaker) for resistance reduction',
        'Follow up with your team',
        'Focus priority targets',
        'Repeat when cooldowns available'
      ],
      tips: [
        'Aggressive initiation tool',
        'Collapses enemy frontlines',
        'Requires team coordination',
        'ZvZ large-scale meta',
        '2026 primary engage weapon'
      ]
    },
    stats: { burstDamage: 60, sustainedDamage: 55, mobility: 65, survivability: 75, range: 20 },
    bestFor: ['ZvZ Engages', 'Large Scale PvP', 'Territory Wars', 'Organized Groups'],
    counters: ['Grouped backline', 'Low mobility targets'],
    weakAgainst: ['Kiting', 'Disengage compositions'],
    gearRecommendations: {
      armor: 'Guardian Armor / Knight Armor',
      shoes: 'Guardian Shoes',
      cape: 'Thetford Cape',
      food: 'Beef Stew',
      potion: 'Health Potion'
    },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },

  // === MORE WARRIOR WEAPONS ===
  {
    id: 'axe',
    name: 'Axe',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'easy',
    role: ['Solo PvP', 'Sustained Damage', 'All-rounder'],
    abilities: [
      { key: 'Q', name: 'Chop', description: 'Quick damage attack', cooldown: 0.5 },
      { key: 'W', name: 'Feral Slash', description: 'AoE damage and bleed', cooldown: 0.8 },
      { key: 'E', name: 'Rampage', description: 'Damage buff and lifesteal', cooldown: 1.2 }
    ],
    rotation: {
      name: 'Sustained DPS',
      steps: [
        'Activate E (Rampage) for damage buff',
        'Use W (Feral Slash) for AoE',
        'Auto-attack between cooldowns',
        'Use Q (Chop) for quick damage',
        'Repeat rotation'
      ],
      tips: [
        'E provides lifesteal for sustain',
        'Good for beginners',
        'Works with any armor type',
        'Strong sustained damage'
      ]
    },
    stats: { burstDamage: 65, sustainedDamage: 80, mobility: 45, survivability: 60, range: 15 },
    bestFor: ['Beginner PvP', 'Solo Content', 'Open World'],
    counters: ['Squishy targets'],
    weakAgainst: ['High burst', 'Kiting'],
    gearRecommendations: { armor: 'Mercenary Jacket', shoes: 'Soldier Boots', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  {
    id: 'mace',
    name: 'Mace',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Tank', 'CC', 'Group Content'],
    abilities: [
      { key: 'Q', name: 'Threatening Smash', description: 'Generate threat', cooldown: 0.8 },
      { key: 'W', name: 'Air Compressor', description: 'Pull enemies', cooldown: 1.0 },
      { key: 'E', name: 'Deep Leap', description: 'Engage with immunity', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Tank Engage',
      steps: [
        'Use E (Deep Leap) to engage',
        'Use W (Air Compressor) to clump',
        'Use Q (Threatening Smash) for threat',
        'Auto-attack between cooldowns',
        'Repeat rotation'
      ],
      tips: [
        'E has immunity frames',
        'Core tank weapon for PvE',
        'W is essential for grouping',
        'Expected in HCE groups'
      ]
    },
    stats: { burstDamage: 50, sustainedDamage: 55, mobility: 50, survivability: 80, range: 15 },
    bestFor: ['Tank PvE', 'Expeditions', 'Main Tank'],
    counters: ['Grouped enemies'],
    weakAgainst: ['Kiting', 'High burst'],
    gearRecommendations: { armor: 'Guardian Armor', shoes: 'Guardian Shoes', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'hammer',
    name: 'Hammer',
    category: 'melee',
    type: 'Two-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['CC', 'Small Scale', 'Disruption'],
    abilities: [
      { key: 'Q', name: 'Iron Breaker', description: 'Resistance reduction', cooldown: 0.8 },
      { key: 'W', name: 'Slowing Charge', description: 'Gap closer', cooldown: 1.0 },
      { key: 'E', name: 'Tackle', description: 'Knockback and stun', cooldown: 1.8 }
    ],
    rotation: {
      name: 'CC Control',
      steps: [
        'Use W (Slowing Charge) to engage',
        'Use E (Tackle) for knockback',
        'Use Q (Iron Breaker) for resistance shred',
        'Auto-attack while CC is active',
        'Repeat when cooldowns available'
      ],
      tips: [
        'Strong CC chain potential',
        'Good for small scale',
        'E can interrupt enemies',
        'Pair with team for follow-up'
      ]
    },
    stats: { burstDamage: 60, sustainedDamage: 55, mobility: 50, survivability: 65, range: 20 },
    bestFor: ['Small Scale', 'CC Compositions', 'Disruption'],
    counters: ['Immobile targets'],
    weakAgainst: ['Kiting', 'High mobility'],
    gearRecommendations: { armor: 'Knight Armor', shoes: 'Soldier Boots', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  {
    id: 'war-gloves',
    name: 'War Gloves',
    category: 'melee',
    type: 'One-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'hard',
    role: ['Burst', 'Combo Heavy', 'Skill Expression'],
    abilities: [
      { key: 'Q', name: 'Pummel', description: 'Quick combo punches', cooldown: 0.4 },
      { key: 'W', name: 'Ground Pound', description: 'AoE knockup', cooldown: 1.0 },
      { key: 'E', name: 'Raging Blades', description: 'Damage buff and mobility', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Combo Burst',
      steps: [
        'Activate E (Raging Blades) for buff',
        'Use Q (Pummel) combo',
        'Use W (Ground Pound) for CC',
        'Weave auto-attacks',
        'Repeat combo'
      ],
      tips: [
        'High skill ceiling',
        'Combo timing is crucial',
        'Strong burst potential',
        'Requires practice to master'
      ]
    },
    stats: { burstDamage: 90, sustainedDamage: 65, mobility: 70, survivability: 45, range: 15 },
    bestFor: ['Skilled Players', 'Burst Damage', 'Small Scale'],
    counters: ['Squishy targets', 'Low mobility'],
    weakAgainst: ['CC heavy', 'Kiting'],
    gearRecommendations: { armor: 'Assassin Jacket', shoes: 'Assassin Shoes', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'shield',
    name: 'Shield',
    category: 'melee',
    type: 'One-Handed Defensive',
    tier: 'T3-T8',
    difficulty: 'easy',
    role: ['Tank', 'Defensive', 'Support'],
    abilities: [
      { key: 'Q', name: 'Shield Bash', description: 'Stun target', cooldown: 0.8 },
      { key: 'W', name: 'Shield Block', description: 'Block incoming damage', cooldown: 1.2 },
      { key: 'E', name: 'Valiant Charge', description: 'Charge and stun', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Defensive Tank',
      steps: [
        'Use E (Valiant Charge) to engage',
        'Use Q (Shield Bash) for stun',
        'Use W (Shield Block) to mitigate',
        'Auto-attack between cooldowns',
        'Repeat rotation'
      ],
      tips: [
        'Highest defensive stats',
        'Can block massive damage',
        'Good for learning tank role',
        'Pair with one-handed weapon'
      ]
    },
    stats: { burstDamage: 40, sustainedDamage: 45, mobility: 40, survivability: 95, range: 10 },
    bestFor: ['Off-Tank', 'Defensive Play', 'Learning Tank'],
    counters: ['Low damage targets'],
    weakAgainst: ['High DPS', 'Magic damage'],
    gearRecommendations: { armor: 'Guardian Armor', shoes: 'Guardian Shoes', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },

  // === MORE HUNTER WEAPONS ===
  {
    id: 'spear',
    name: 'Spear',
    category: 'melee',
    type: 'Two-Handed Melee',
    tier: 'T3-T8',
    difficulty: 'easy',
    role: ['Beginner Friendly', 'Safe Ranged Melee'],
    abilities: [
      { key: 'Q', name: 'Piercing Lance', description: 'Long range poke', cooldown: 0.6 },
      { key: 'W', name: 'Spear Throw', description: 'Slow target', cooldown: 0.8 },
      { key: 'E', name: 'Leap', description: 'Jump to target', cooldown: 1.2 }
    ],
    rotation: {
      name: 'Safe Poke',
      steps: [
        'Poke with Q from max range',
        'Use W to slow if engaged',
        'Use E to finish or escape',
        'Auto-attack between abilities',
        'Maintain distance'
      ],
      tips: [
        'Excellent for beginners',
        'Safe range for melee',
        'W slow is crucial',
        'Good open world weapon'
      ]
    },
    stats: { burstDamage: 65, sustainedDamage: 70, mobility: 50, survivability: 75, range: 25 },
    bestFor: ['Beginners', 'Open World', 'Solo Dungeons'],
    counters: ['Immobile targets'],
    weakAgainst: ['High burst', 'Ranged weapons'],
    gearRecommendations: { armor: 'Mercenary Jacket', shoes: 'Soldier Boots', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'shapeshifter-staff',
    name: 'Shapeshifter Staff',
    category: 'hybrid',
    type: 'Two-Handed Hybrid',
    tier: 'T4-T8',
    difficulty: 'hard',
    role: ['Transformation', 'Versatile', 'Skill Expression'],
    abilities: [
      { key: 'Q', name: 'Primal Form', description: 'Transform and gain stats', cooldown: 1.5 },
      { key: 'W', name: 'Lycan Bite', description: 'Bite and heal', cooldown: 0.8 },
      { key: 'E', name: 'Wolf Form', description: 'Transform into wolf', cooldown: 2.0 }
    ],
    rotation: {
      name: 'Form Switching',
      steps: [
        'Use E (Wolf Form) for mobility',
        'Transform with Q for combat',
        'Use W (Lycan Bite) for sustain',
        'Switch forms as needed',
        'Adapt to situation'
      ],
      tips: [
        'Very versatile weapon',
        'Form switching is key',
        'Good sustain with bite',
        'Requires game knowledge'
      ]
    },
    stats: { burstDamage: 75, sustainedDamage: 70, mobility: 65, survivability: 70, range: 20 },
    bestFor: ['Versatile Play', 'Solo Content', 'Skilled Players'],
    counters: ['Squishy targets'],
    weakAgainst: ['CC heavy', 'Burst'],
    gearRecommendations: { armor: 'Mercenary Jacket', shoes: 'Soldier Boots', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  {
    id: 'torch',
    name: 'Torch',
    category: 'hybrid',
    type: 'One-Handed Hybrid',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Support', 'Utility', 'Off-Hand'],
    abilities: [
      { key: 'Q', name: 'Flame Throw', description: 'Throw flame', cooldown: 0.6 },
      { key: 'W', name: 'Light Up', description: 'Reveal area', cooldown: 1.0 },
      { key: 'E', name: 'Fire Wall', description: 'Create fire wall', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Utility Support',
      steps: [
        'Use E (Fire Wall) for zone control',
        'Use Q (Flame Throw) for damage',
        'Use W (Light Up) for vision',
        'Pair with one-handed weapon',
        'Support your team'
      ],
      tips: [
        'Used as off-hand',
        'Good utility',
        'Fire wall blocks paths',
        'Vision control is valuable'
      ]
    },
    stats: { burstDamage: 50, sustainedDamage: 55, mobility: 50, survivability: 60, range: 20 },
    bestFor: ['Off-Hand', 'Utility', 'Support'],
    counters: ['Melee without gap closer'],
    weakAgainst: ['Ranged', 'High burst'],
    gearRecommendations: { armor: 'Mercenary Jacket', shoes: 'Soldier Boots', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Health Potion' },
    metaRating: 'C',
    lastUpdated: '2026-03'
  },

  // === MORE MAGE WEAPONS ===
  {
    id: 'holy-staff',
    name: 'Holy Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Healer', 'Support', 'Group Content'],
    abilities: [
      { key: 'Q', name: 'Holy Light', description: 'Single target heal', cooldown: 0.6 },
      { key: 'W', name: 'Divine Protection', description: 'Shield ally', cooldown: 1.0 },
      { key: 'E', name: 'Healing Beacon', description: 'AoE heal over time', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Main Healer',
      steps: [
        'Keep E (Healing Beacon) on tank',
        'Use Q (Holy Light) for direct heal',
        'Use W (Divine Protection) for burst damage',
        'Auto-attack when not healing',
        'Manage mana carefully'
      ],
      tips: [
        'Primary healer for groups',
        'Strong single target healing',
        'W shield is powerful',
        'Essential for HCE'
      ]
    },
    stats: { burstDamage: 35, sustainedDamage: 45, mobility: 45, survivability: 50, range: 25 },
    bestFor: ['Main Healer', 'Group PvE', 'HCE'],
    counters: ['N/A - Support'],
    weakAgainst: ['Dive compositions', 'OOM'],
    gearRecommendations: { armor: 'Cleric Robe', shoes: 'Scholar Sandals', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Mana Potion' },
    metaRating: 'S',
    lastUpdated: '2026-03'
  },
  {
    id: 'arcane-staff',
    name: 'Arcane Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'hard',
    role: ['Utility', 'Support', 'Damage'],
    abilities: [
      { key: 'Q', name: 'Arcane Bolt', description: 'Magic damage', cooldown: 0.6 },
      { key: 'W', name: 'Teleport', description: 'Short range teleport', cooldown: 1.2 },
      { key: 'E', name: 'Energy Tap', description: 'Mana restore', cooldown: 1.8 }
    ],
    rotation: {
      name: 'Utility Caster',
      steps: [
        'Use Q (Arcane Bolt) for damage',
        'Use W (Teleport) for positioning',
        'Use E (Energy Tap) for mana',
        'Support team with utility',
        'Maintain mana pool'
      ],
      tips: [
        'Teleport is very versatile',
        'Good mana sustain',
        'Utility over raw damage',
        'Requires good positioning'
      ]
    },
    stats: { burstDamage: 70, sustainedDamage: 65, mobility: 75, survivability: 40, range: 25 },
    bestFor: ['Utility Support', 'Skilled Players', 'Small Scale'],
    counters: ['Immobile targets'],
    weakAgainst: ['Assassins', 'High burst'],
    gearRecommendations: { armor: 'Scholar Robe', shoes: 'Scholar Sandals', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Mana Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  {
    id: 'frost-staff',
    name: 'Frost Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Control', 'Kiting', 'Utility'],
    abilities: [
      { key: 'Q', name: 'Frost Bolt', description: 'Slow target', cooldown: 0.6 },
      { key: 'W', name: 'Ice Wall', description: 'Create ice wall', cooldown: 1.2 },
      { key: 'E', name: 'Freeze', description: 'Root target', cooldown: 1.8 }
    ],
    rotation: {
      name: 'Control Mage',
      steps: [
        'Use Q (Frost Bolt) to slow',
        'Use E (Freeze) to root',
        'Use W (Ice Wall) for zone control',
        'Kite while casting',
        'Maintain distance'
      ],
      tips: [
        'Strong control potential',
        'W all blocks paths',
        'Good for kiting',
        'Team coordination needed'
      ]
    },
    stats: { burstDamage: 60, sustainedDamage: 65, mobility: 40, survivability: 45, range: 25 },
    bestFor: ['Control', 'Kiting', 'Team Fights'],
    counters: ['Melee without gap closer'],
    weakAgainst: ['High mobility', 'Assassins'],
    gearRecommendations: { armor: 'Scholar Robe', shoes: 'Scholar Sandals', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Mana Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  },
  {
    id: 'cursed-staff',
    name: 'Cursed Staff',
    category: 'staff',
    type: 'Two-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'hard',
    role: ['Debuff', 'Damage Over Time', 'Control'],
    abilities: [
      { key: 'Q', name: 'Cursed Bolt', description: 'Apply curse', cooldown: 0.6 },
      { key: 'W', name: 'Well of Corruption', description: 'AoE curse', cooldown: 1.0 },
      { key: 'E', name: 'Curse of Undeath', description: 'Powerful debuff', cooldown: 2.0 }
    ],
    rotation: {
      name: 'Curse Master',
      steps: [
        'Use E (Curse of Undeath) on priority',
        'Use W (Well of Corruption) for AoE',
        'Use Q (Cursed Bolt) to spread',
        'Maintain curses on targets',
        'Kite while cursing'
      ],
      tips: [
        'Curses reduce enemy stats',
        'Strong in team fights',
        'DoT damage adds up',
        'Requires good timing'
      ]
    },
    stats: { burstDamage: 65, sustainedDamage: 80, mobility: 35, survivability: 40, range: 25 },
    bestFor: ['Team Fights', 'Debuff Support', 'DoT Damage'],
    counters: ['Grouped enemies', 'Low cleanse'],
    weakAgainst: ['High mobility', 'Assassins'],
    gearRecommendations: { armor: 'Scholar Robe', shoes: 'Scholar Sandals', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Mana Potion' },
    metaRating: 'A',
    lastUpdated: '2026-03'
  },
  {
    id: 'tome-of-spells',
    name: 'Tome of Spells',
    category: 'staff',
    type: 'One-Handed Magic',
    tier: 'T3-T8',
    difficulty: 'medium',
    role: ['Support', 'Utility', 'Off-Hand'],
    abilities: [
      { key: 'Q', name: 'Spell Spray', description: 'Multiple projectiles', cooldown: 0.6 },
      { key: 'W', name: 'Protective Ward', description: 'Shield ally', cooldown: 1.0 },
      { key: 'E', name: 'Energy Orb', description: 'Heal over time', cooldown: 1.5 }
    ],
    rotation: {
      name: 'Support Caster',
      steps: [
        'Use W (Protective Ward) on tank',
        'Use E (Energy Orb) for healing',
        'Use Q (Spell Spray) for damage',
        'Support your team',
        'Pair with shield or focus'
      ],
      tips: [
        'Used as main hand',
        'Good utility support',
        'Can pair with shield',
        'Versatile kit'
      ]
    },
    stats: { burstDamage: 55, sustainedDamage: 60, mobility: 45, survivability: 55, range: 25 },
    bestFor: ['Support', 'Utility', 'Small Scale'],
    counters: ['Low mobility'],
    weakAgainst: ['High burst', 'Assassins'],
    gearRecommendations: { armor: 'Cleric Robe', shoes: 'Scholar Sandals', cape: 'Thetford Cape', food: 'Beef Stew', potion: 'Mana Potion' },
    metaRating: 'B',
    lastUpdated: '2026-03'
  }
];

// Weapon categories for filtering
export const WEAPON_CATEGORIES = {
  melee: 'Melee Weapons',
  ranged: 'Ranged Weapons',
  staff: 'Staff Weapons',
  hybrid: 'Hybrid Weapons'
} as const;

// Meta ratings for filtering
export const META_RATINGS = {
  S: 'S-Tier (Meta Defining)',
  A: 'A-Tier (Strong Pick)',
  B: 'B-Tier (Viable)',
  C: 'C-Tier (Situational)'
} as const;

// Content types for filtering
export const CONTENT_TYPES = {
  'Solo PvP': 'Solo PvP',
  'Small Scale': 'Small Scale (5v5-20v20)',
  'ZvZ': 'ZvZ (Large Scale)',
  'Group PvE': 'Group PvE',
  'Ganking': 'Ganking',
  'Open World': 'Open World'
} as const;
