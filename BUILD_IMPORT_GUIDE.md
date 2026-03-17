# 📚 AlbionKit Build Import System

## Overview

This system allows you to import curated Albion Online builds from blogs, videos, and articles directly into your Firestore database.

---

## 📁 Files

### 1. `builds-import-2026.json`
Contains the build data in a structured format.

### 2. `scripts/import-builds.js`
Node.js script to import builds to Firestore.

---

## 🚀 How to Use

### Step 1: Install Dependencies (if needed)

```bash
npm install firebase-admin
```

### Step 2: Set Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Step 3: Run the Import Script

```bash
node scripts/import-builds.js
```

The script will:
1. Ask for your Firebase User ID
2. Ask for display name (default: "AlbionKit Team")
3. Ask if you want dry run mode
4. Import all builds from the JSON file

### Step 4: Verify in App

After import, visit `/builds` to see the newly imported builds!

---

## 📝 Build JSON Structure

### Required Fields

```json
{
  "title": "Build Name",
  "description": "Short description (1-2 sentences)",
  "category": "solo|small-scale|pvp|zvz|large-scale|group",
  "items": {
    "MainHand": { "Type": "T8_2H_CURSEDSTAFF" }
  }
}
```

### Optional Fields

```json
{
  "longDescription": "Markdown guide content",
  "youtubeLink": "https://youtube.com/watch?v=...",
  "tags": ["PvP", "Solo", "Ganking"],
  "strengths": ["High burst", "Good mobility"],
  "weaknesses": ["Vulnerable to CC", "Expensive"],
  "mobility": "low|medium|high",
  "difficulty": "easy|medium|hard"
}
```

### Item Slots

Available slots in the `items` object:

- `MainHand` - Primary weapon
- `OffHand` - Off-hand item (shield, torch, etc.)
- `Head` - Helmet
- `Armor` - Chest armor
- `Shoes` - Footwear
- `Cape` - Cape
- `Potion` - Combat potion
- `Food` - Food buff
- `Mount` - Combat mount
- `Bag` - Bag

### Item Format

```json
{
  "Type": "T8_2H_CURSEDSTAFF",      // Required: Item unique name
  "Quality": 3,                      // Optional: 0-4 (Normal, Good, Outstanding, Excellent, Masterpiece)
  "Alternatives": ["T8_2H_DAMNATIONSTAFF"]  // Optional: Alternative items
}
```

---

## 🎯 Finding Builds to Import

### Sources

1. **YouTube Videos**
   - Look for build guides from popular creators
   - Check video descriptions for gear lists
   - Example: "Best Solo Build 2026" videos

2. **Blogs & Articles**
   - [Albion Online Builds](https://www.albiononlinebuilds.com/)
   - [Metabattle](https://metabattle.com/albion/)
   - Community guides

3. **Reddit**
   - r/albiononline build guides
   - Community build challenges

### Extracting Build Information

From a typical video/article, look for:

1. **Weapon**: Main damage source (e.g., "Cursed Staff", "Infernal Scythe")
2. **Armor Type**: Plate, Leather, or Cloth
3. **Accessories**: Cape, Bag, Shoes, Helmet
4. **Consumables**: Food, Potion
5. **Mount**: Combat mount choice
6. **Playstyle**: Aggressive, defensive, mobile, etc.

---

## 📋 Build Categories

| Category | Description | Example |
|----------|-------------|---------|
| `solo` | Solo open world PvP/ganking | Cursed Staff ganking |
| `small-scale` | 2v2, 3v3, 5v5 | Hellgate duo |
| `pvp` | General PvP (corrupted dungeons, etc.) | Solo queue builds |
| `zvz` | Small to medium ZvZ (10v10-50v50) | ZvZ healer |
| `large-scale` | Big ZvZ (100v100+) | ZvZ tank, main healer |
| `group` | Group PvE, gathering | Gathering build, group PvE |

---

## 🏷️ Tag Suggestions

Use these standard tags for consistency:

- **PvP** - Player vs Player focused
- **PvE** - Player vs Environment
- **Solo** - Designed for solo play
- **Group** - Requires team
- **ZvZ** - ZvZ focused
- **Hellgate** - Hellgate optimized
- **Ganking** - Black zone ganking
- **Escape** - High mobility escape build
- **Tank** - Tank role
- **Healer** - Healer role
- **DPS** - Damage dealer
- **Burst** - High burst damage
- **Sustain** - Long fight sustain
- **Budget** - Cheap, accessible build
- **Meta** - Current meta build

---

## 🔧 Quality Levels

Map quality numbers to in-game quality:

| Number | Quality | Silver Stars |
|--------|---------|--------------|
| 0 | Normal | ⭐ |
| 1 | Good | ⭐⭐ |
| 2 | Outstanding | ⭐⭐⭐ |
| 3 | Excellent | ⭐⭐⭐⭐ |
| 4 | Masterpiece | ⭐⭐⭐⭐⭐ |

---

## 📊 Example: Adding a New Build

Let's say you found a great **Arcane Staff** build on YouTube:

```json
{
  "title": "Arcane Staff Burst Build",
  "description": "One-shot combo build for solo PvP. Deletes squishies instantly.",
  "category": "solo",
  "authorName": "AlbionKit Team",
  "tags": ["PvP", "Solo", "Burst", "Combo"],
  "youtubeLink": "https://youtube.com/watch?v=example",
  "strengths": [
    "Instant delete combo",
    "Long range engage",
    "High skill expression"
  ],
  "weaknesses": [
    "All-in commitment",
    "Vulnerable after combo",
    "Expensive gear"
  ],
  "mobility": "medium",
  "difficulty": "hard",
  "items": {
    "MainHand": {
      "Type": "T8_2H_ARCANE",
      "Quality": 3
    },
    "OffHand": {
      "Type": "T8_OFF_BOOK",
      "Quality": 3
    },
    "Head": {
      "Type": "T8_CLOTH_HELM",
      "Quality": 3
    },
    "Armor": {
      "Type": "T8_CLOTH_ARMOR",
      "Quality": 3
    },
    "Shoes": {
      "Type": "T8_CLOTH_SHOES",
      "Quality": 3
    },
    "Cape": {
      "Type": "T8_CAPE_ITEM_SWIFT",
      "Quality": 3
    },
    "Potion": {
      "Type": "T8_POTION_HEAL",
      "Quality": 3
    },
    "Food": {
      "Type": "T8_FISH_STEW"
    },
    "Mount": {
      "Type": "T8_MOUNT_SWIFT"
    },
    "Bag": {
      "Type": "T8_BAG_ITEM_POCKETMIRROR"
    }
  },
  "longDescription": "# Arcane Staff Build Guide\n\n## Combo\n1. E from max range\n2. Q while E is channeling\n3. Auto attack\n4. W if they try to escape\n\n## Tips\n- Practice combo in hideout\n- Wait for enemy cooldowns\n- Position carefully"
  }
}
```

---

## ⚠️ Important Notes

1. **Item IDs**: Use official Albion Online item unique names (e.g., `T8_2H_CURSEDSTAFF`)
2. **Quality**: 0-4 scale (Normal to Masterpiece)
3. **Categories**: Must be one of the 6 valid categories
4. **Author**: All imported builds will use the configured User ID
5. **Timestamps**: Automatically added by the script

---

## 🐛 Troubleshooting

### "Missing Firebase credentials"
- Check your `.env.local` file
- Verify environment variables are set correctly

### "User profile not found"
- Double-check the User ID
- Make sure the user exists in Firestore

### "Build import failed"
- Check the error message
- Verify item IDs are correct
- Ensure category is valid

### "Builds not showing in app"
- Wait a few minutes for cache to clear
- Try refreshing the page
- Check Firestore to confirm builds were saved

---

## 📈 Best Practices

1. **Test with Dry Run First**: Always run with `dryRun: true` initially
2. **Start Small**: Import 2-3 builds first to test
3. **Verify Item IDs**: Double-check item names against the Albion API
4. **Add YouTube Links**: Helps users learn the build
5. **Write Descriptions**: Clear, helpful descriptions improve UX
6. **Use Tags**: Proper tagging helps users find builds
7. **Include Alternatives**: List alternative items for budget options

---

## 🎓 Learning Resources

- [Albion Online Character Builder](https://albiononline.com/characterbuilder) - Official tool
- [Albion Data Project](https://albiondata.com/) - Item database
- [Albion Online Wiki](https://wiki.albiononline.com/) - Item information

---

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Review the error messages
3. Verify your configuration
4. Check Firestore directly to debug

Happy importing! 🎮
