export const CRAFT_BRANCHES = {
  'Warrior': {
    'Swords': ['Broadsword', 'Claymore', 'Dual Swords'],
    'Plate Armor': ['Soldier Armor', 'Knight Armor', 'Graveguard Armor'],
    'Plate Helmet': ['Soldier Helmet', 'Knight Helmet', 'Graveguard Helmet'],
    'Plate Shoes': ['Soldier Boots', 'Knight Boots', 'Graveguard Boots']
  },
  'Hunter': {
    'Bows': ['Bow', 'Warbow', 'Longbow'],
    'Leather Armor': ['Mercenary Jacket', 'Hunter Jacket', 'Assassin Jacket'],
    'Leather Helmet': ['Mercenary Hood', 'Hunter Hood', 'Assassin Hood'],
    'Leather Shoes': ['Mercenary Shoes', 'Hunter Shoes', 'Assassin Shoes']
  },
  'Mage': {
    'Fire Staffs': ['Fire Staff', 'Great Fire Staff', 'Infernal Staff'],
    'Cloth Armor': ['Scholar Robe', 'Cleric Robe', 'Mage Robe'],
    'Cloth Helmet': ['Scholar Cowl', 'Cleric Cowl', 'Mage Cowl'],
    'Cloth Shoes': ['Scholar Sandals', 'Cleric Sandals', 'Mage Sandals']
  },
  'Toolmaker': {
    'Tools': ['Pickaxe', 'Wood Axe', 'Stone Hammer', 'Sickle', 'Skinning Knife'],
    'Accessories': ['Bag', 'Cape']
  }
};

export const RECIPES = {
  'Broadsword': { itemSuffix: 'MAIN_SWORD', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 16, 'METALBAR': 8 }, nutrition: 45, journal: 'WARRIOR' },
  'Claymore': { itemSuffix: '2H_CLAYMORE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 20, 'METALBAR': 12 }, nutrition: 67.5, journal: 'WARRIOR' },
  'Dual Swords': { itemSuffix: '2H_DUALSWORD', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 20, 'METALBAR': 12 }, nutrition: 67.5, journal: 'WARRIOR' },
  'Soldier Armor': { itemSuffix: 'ARMOR_PLATE_SET1', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 16 }, nutrition: 45, journal: 'WARRIOR' },
  'Knight Armor': { itemSuffix: 'ARMOR_PLATE_SET2', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 16 }, nutrition: 45, journal: 'WARRIOR' },
  'Graveguard Armor': { itemSuffix: 'ARMOR_PLATE_UNDEAD', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 16 }, nutrition: 45, journal: 'WARRIOR' },
  'Soldier Helmet': { itemSuffix: 'HEAD_PLATE_SET1', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 8 }, nutrition: 22.5, journal: 'WARRIOR' },
  'Knight Helmet': { itemSuffix: 'HEAD_PLATE_SET2', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 8 }, nutrition: 22.5, journal: 'WARRIOR' },
  'Graveguard Helmet': { itemSuffix: 'HEAD_PLATE_UNDEAD', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 8 }, nutrition: 22.5, journal: 'WARRIOR' },
  'Soldier Boots': { itemSuffix: 'SHOES_PLATE_SET1', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 8 }, nutrition: 22.5, journal: 'WARRIOR' },
  'Knight Boots': { itemSuffix: 'SHOES_PLATE_SET2', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 8 }, nutrition: 22.5, journal: 'WARRIOR' },
  'Graveguard Boots': { itemSuffix: 'SHOES_PLATE_UNDEAD', tiers: [4,5,6,7,8], ingredients: { 'METALBAR': 8 }, nutrition: 22.5, journal: 'WARRIOR' },

  'Bow': { itemSuffix: 'MAIN_BOW', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 32 }, nutrition: 45, journal: 'HUNTER' },
  'Warbow': { itemSuffix: '2H_BOW', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 32 }, nutrition: 45, journal: 'HUNTER' },
  'Longbow': { itemSuffix: '2H_LONGBOW', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 32 }, nutrition: 45, journal: 'HUNTER' },
  'Mercenary Jacket': { itemSuffix: 'ARMOR_LEATHER_SET1', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 16 }, nutrition: 45, journal: 'HUNTER' },
  'Hunter Jacket': { itemSuffix: 'ARMOR_LEATHER_SET2', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 16 }, nutrition: 45, journal: 'HUNTER' },
  'Assassin Jacket': { itemSuffix: 'ARMOR_LEATHER_SET3', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 16 }, nutrition: 45, journal: 'HUNTER' },
  'Mercenary Hood': { itemSuffix: 'HEAD_LEATHER_SET1', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 8 }, nutrition: 22.5, journal: 'HUNTER' },
  'Hunter Hood': { itemSuffix: 'HEAD_LEATHER_SET2', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 8 }, nutrition: 22.5, journal: 'HUNTER' },
  'Assassin Hood': { itemSuffix: 'HEAD_LEATHER_SET3', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 8 }, nutrition: 22.5, journal: 'HUNTER' },
  'Mercenary Shoes': { itemSuffix: 'SHOES_LEATHER_SET1', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 8 }, nutrition: 22.5, journal: 'HUNTER' },
  'Hunter Shoes': { itemSuffix: 'SHOES_LEATHER_SET2', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 8 }, nutrition: 22.5, journal: 'HUNTER' },
  'Assassin Shoes': { itemSuffix: 'SHOES_LEATHER_SET3', tiers: [4,5,6,7,8], ingredients: { 'LEATHER': 8 }, nutrition: 22.5, journal: 'HUNTER' },

  'Fire Staff': { itemSuffix: 'MAIN_STAFF_FIRE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 16, 'METALBAR': 8 }, nutrition: 45, journal: 'MAGE' },
  'Great Fire Staff': { itemSuffix: '2H_STAFF_FIRE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 20, 'METALBAR': 12 }, nutrition: 67.5, journal: 'MAGE' },
  'Infernal Staff': { itemSuffix: '2H_INFERNOSTAFF', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 20, 'METALBAR': 12 }, nutrition: 67.5, journal: 'MAGE' },
  'Scholar Robe': { itemSuffix: 'ARMOR_CLOTH_SET1', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 16 }, nutrition: 45, journal: 'MAGE' },
  'Cleric Robe': { itemSuffix: 'ARMOR_CLOTH_SET2', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 16 }, nutrition: 45, journal: 'MAGE' },
  'Mage Robe': { itemSuffix: 'ARMOR_CLOTH_SET3', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 16 }, nutrition: 45, journal: 'MAGE' },
  'Scholar Cowl': { itemSuffix: 'HEAD_CLOTH_SET1', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8 }, nutrition: 22.5, journal: 'MAGE' },
  'Cleric Cowl': { itemSuffix: 'HEAD_CLOTH_SET2', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8 }, nutrition: 22.5, journal: 'MAGE' },
  'Mage Cowl': { itemSuffix: 'HEAD_CLOTH_SET3', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8 }, nutrition: 22.5, journal: 'MAGE' },
  'Scholar Sandals': { itemSuffix: 'SHOES_CLOTH_SET1', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8 }, nutrition: 22.5, journal: 'MAGE' },
  'Cleric Sandals': { itemSuffix: 'SHOES_CLOTH_SET2', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8 }, nutrition: 22.5, journal: 'MAGE' },
  'Mage Sandals': { itemSuffix: 'SHOES_CLOTH_SET3', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8 }, nutrition: 22.5, journal: 'MAGE' },

  'Pickaxe': { itemSuffix: 'TOOL_PICKAXE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 2, 'METALBAR': 6 }, nutrition: 11.25, journal: 'TOOLMAKER' },
  'Wood Axe': { itemSuffix: 'TOOL_AXE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 2, 'METALBAR': 6 }, nutrition: 11.25, journal: 'TOOLMAKER' },
  'Stone Hammer': { itemSuffix: 'TOOL_STONEHAMMER', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 2, 'METALBAR': 6 }, nutrition: 11.25, journal: 'TOOLMAKER' },
  'Sickle': { itemSuffix: 'TOOL_SICKLE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 2, 'METALBAR': 6 }, nutrition: 11.25, journal: 'TOOLMAKER' },
  'Skinning Knife': { itemSuffix: 'TOOL_KNIFE', tiers: [4,5,6,7,8], ingredients: { 'PLANKS': 2, 'METALBAR': 6 }, nutrition: 11.25, journal: 'TOOLMAKER' },
  'Bag': { itemSuffix: 'BAG', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8, 'LEATHER': 8 }, nutrition: 22.5, journal: 'TOOLMAKER' },
  'Cape': { itemSuffix: 'CAPE', tiers: [4,5,6,7,8], ingredients: { 'CLOTH': 8, 'LEATHER': 8 }, nutrition: 22.5, journal: 'TOOLMAKER' }
};

export const CITIES = [
  'Caerleon',
  'Bridgewatch',
  'Martlock',
  'Thetford',
  'Fort Sterling',
  'Lymhurst',
  'Black Market'
];
