# 🔍 Item ID Validation Guide

## Overview

Before importing builds to Firestore, you should validate all item IDs to ensure they exist in the Albion Online database and won't show broken images in the app.

---

## 📁 Files

### 1. `scripts/validate-items.js`
Node.js script that validates all item IDs against the official Albion Data Project API.

### 2. `builds-import-2026.json`
The build data file that gets validated.

---

## 🚀 How to Use

### Step 1: Run Validation

```bash
node scripts/validate-items.js
```

### Step 2: Review Results

The script will:
1. ✅ Fetch the latest item database from Albion Data Project
2. ✅ Cache the data locally (for 24 hours)
3. ✅ Check every item ID in your builds
4. ✅ Report any invalid or missing items

### Step 3: Fix Issues (if any)

If invalid items are found:
1. Check the error messages
2. Find correct item IDs on [Albion Online Wiki](https://wiki.albiononline.com/)
3. Update `builds-import-2026.json`
4. Run validation again

### Step 4: Import

Once all items are validated:
```bash
node scripts/import-builds.js
```

---

## 📊 Example Output

### ✅ Success Case

```
🔍 AlbionKit Item ID Validator

📖 Loading builds from: builds-import-2026.json
✅ Loaded 6 builds

📡 Fetching item database from Albion Data Project...
   This may take a minute (file is ~50MB)...
✅ Loaded 6234 items from API
💾 Item cache saved
✅ Item database ready (6234 items)

🔍 Validating item IDs...

[1/6] Checking: Cursed Staff Plate Solo PvP Build
  ✅ MainHand: T8_2H_CURSEDSTAFF → Cursed Staff
  ✅ OffHand: T8_OFF_TORCH → Torch
  ✅ Head: T8_HEAD_PLATE_SET2 → Soldier Helmet
  ✅ Armor: T8_ARMOR_PLATE_SET2 → Soldier Armor
  ...

================================
📊 Validation Summary
================================
✅ Valid: 60/60
❌ Invalid: 0/60
📈 Success Rate: 100.0%

✨ All item IDs are valid!
💡 You can now safely run: node scripts/import-builds.js
```

### ❌ Error Case

```
[1/6] Checking: Cursed Staff Plate Solo PvP Build
  ❌ Main - MainHand: T8_2H_INVALIDSTAFF
     Reason: Item not found in database
  ✅ OffHand: T8_OFF_TORCH → Torch
  ...

================================
📊 Validation Summary
================================
✅ Valid: 58/60
❌ Invalid: 2/60
📈 Success Rate: 96.7%

❌ Invalid Items Found:

1. Cursed Staff Plate Solo PvP Build
   Slot: MainHand
   Item ID: T8_2H_INVALIDSTAFF
   Reason: Item not found in database

2. Infernal Scythe 5v5 Hellgate Build
   Slot: MainHand
   Item ID: T8_2H_SCYTHE_FAKE
   Reason: Item not found in database

💡 Next Steps:
   1. Check the item IDs above
   2. Use https://wiki.albiononline.com/ to find correct IDs
   3. Update builds-import-2026.json
   4. Run validation again
```

---

## 🔧 How It Works

### 1. Fetch Item Database
- Downloads `items.json` from Albion Data Project
- File contains ~6000+ items with all localized names
- Cached locally for 24 hours to avoid repeated downloads

### 2. Extract Item IDs
- Reads all builds from JSON file
- Extracts item IDs from each equipment slot
- Also checks alternative items

### 3. Validate Each Item
For each item ID:
- ✅ Check if it exists in database
- ✅ Verify it has English localized name
- ✅ Confirm it's not an internal/uncraftable item

### 4. Report Results
- Shows valid items with their English names
- Reports invalid items with reasons
- Provides success rate percentage

---

## 📝 Item ID Format

Albion Online item IDs follow this pattern:

```
T{Tier}_{Slot}_{Type}_{Variant}
```

### Examples:

| Item ID | Breakdown |
|---------|-----------|
| `T8_2H_CURSEDSTAFF` | Tier 8, 2-Handed, Cursed Staff |
| `T8_HEAD_PLATE_SET2` | Tier 8, Head, Plate Armor, Soldier Set |
| `T8_ARMOR_LEATHER_SET3` | Tier 8, Armor, Leather, Assassin Jacket |
| `T8_OFF_TORCH` | Tier 8, Off-hand, Torch |
| `T8_CAPEITEM_SWIFT` | Tier 8, Cape, Swift Cape |
| `T8_POTION_HEAL` | Tier 8, Potion, Healing Potion |
| `T8_MEAL_STEW` | Tier 8, Food, Meat Stew |

### Tier Levels:
- T4 = Tier 4
- T5 = Tier 5
- T6 = Tier 6
- T7 = Tier 7
- T8 = Tier 8

### Slot Types:
- `2H` - Two-handed weapon
- `MAIN` - Main-hand weapon (one-handed)
- `OFF` - Off-hand item
- `HEAD` - Helmet
- `ARMOR` - Chest armor
- `SHOES` - Footwear
- `CAPEITEM` - Cape
- `POTION` - Potion
- `MEAL` - Food
- `BAG_ITEM` - Bag
- `MOUNT` - Mount

---

## 🎯 Common Item ID Patterns

### Weapons:
```
T8_2H_CURSEDSTAFF          # Cursed Staff
T8_2H_INFERNALSCYTHE       # Infernal Scythe
T8_2H_HOLYSTAFF            # Holy Staff
T8_MAIN_RAPIER_MORGANA     # Bloodletter
T8_2H_CHILLHOWL            # Chillhowl
T8_2H_NATURESTAFF          # Nature Staff
```

### Armor Sets:
```
# Plate (Soldier)
T8_HEAD_PLATE_SET2         # Soldier Helmet
T8_ARMOR_PLATE_SET2        # Soldier Armor
T8_SHOES_PLATE_SET2        # Soldier Boots

# Leather (Assassin)
T8_HEAD_LEATHER_SET3       # Assassin Hood
T8_ARMOR_LEATHER_SET3      # Assassin Jacket
T8_SHOES_LEATHER_SET3      # Assassin Shoes

# Cloth (Scholar)
T8_HEAD_CLOTH_SET2         # Scholar Cowl
T8_ARMOR_CLOTH_SET2        # Scholar Robe
T8_SHOES_CLOTH_SET2        # Scholar Sandals
```

### Special Items:
```
T8_OFF_TORCH               # Torch
T8_OFF_TOTEM               # Totem
T8_CAPEITEM_TANK           # Guardian Cape
T8_CAPEITEM_SWIFT          # Swift Cape
T8_CAPEITEM_UNDEAD         # Undead Cape
T8_POTION_HEAL             # Healing Potion
T8_POTION_CLEANSE          # Cleansing Potion
T8_MEAL_STEW               # Meat Stew
```

---

## ⚠️ Common Issues

### 1. Wrong Format
❌ `T8_PLATE_HELM` (old format)
✅ `T8_HEAD_PLATE_SET2` (correct format)

### 2. Missing Slot Prefix
❌ `T8_CURSEDSTAFF`
✅ `T8_2H_CURSEDSTAFF`

### 3. Typos
❌ `T8_2H_CURESSEDSTAFF`
✅ `T8_2H_CURSEDSTAFF`

### 4. Non-existent Items
❌ `T8_2H_FAKEWEAPON`
✅ Use real item IDs from wiki

---

## 🔍 Finding Correct Item IDs

### Method 1: Albion Online Wiki
1. Go to https://wiki.albiononline.com/
2. Search for the item
3. Look at the URL or infobox for UniqueName

### Method 2: In-Game
1. Enable item ID display in settings
2. Hover over item in game
3. Copy the UniqueName

### Method 3: Albion Data Project
1. Visit https://albiondata.com/
2. Browse item database
3. Find the item's UniqueName

---

## 💡 Tips

1. **Always validate before importing** - Saves time fixing broken builds
2. **Use cache** - First validation is slow, subsequent ones are fast
3. **Check alternatives** - Alternative items are also validated
4. **Keep IDs updated** - Item IDs can change between patches

---

## 🐛 Troubleshooting

### "Failed to fetch items"
- Check your internet connection
- Try again (GitHub may be temporarily unavailable)
- Use a different network if behind a firewall

### "Cache load failed"
- Delete `.item-cache.json` if it exists
- Script will create fresh cache

### "Item not found in database"
- Double-check the item ID spelling
- Verify the item exists in current patch
- Check if item was renamed/removed

### "Item has no localized names"
- This item may be uncraftable or internal
- Use a different, player-obtainable item
- Check the wiki for alternatives

---

## 📊 Cache System

The validator caches the item database to speed up subsequent runs:

- **Cache File**: `.item-cache.json` (in project root)
- **Cache Duration**: 24 hours
- **Cache Size**: ~5-10MB (compressed)

To force refresh:
```bash
rm .item-cache.json  # Delete cache
node scripts/validate-items.js  # Will fetch fresh data
```

---

## ✅ Validation Checklist

Before running import:

- [ ] Run `node scripts/validate-items.js`
- [ ] Verify 100% success rate
- [ ] Fix any invalid items
- [ ] Re-run validation if changes made
- [ ] Confirm all items show ✅

---

## 📞 Support

If validation fails:
1. Check error messages carefully
2. Verify item IDs on wiki
3. Ensure internet connection
4. Try deleting cache and re-running

---

**Status**: ✅ Ready to validate!

Run `node scripts/validate-items.js` to check your builds! 🎮
