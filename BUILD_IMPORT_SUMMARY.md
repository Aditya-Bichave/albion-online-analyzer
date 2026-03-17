# ✅ AlbionKit Build Import System - Complete

## What Was Created

### 1. **Build Import JSON** (`builds-import-2026.json`)
- Contains **6 meta builds** for 2026
- Based on latest YouTube videos and community guides
- Covers all categories: Solo, PvP, ZvZ, Group

### 2. **Import Script** (`scripts/import-builds.js`)
- Node.js script to import builds to Firestore
- Interactive configuration
- Dry run mode for testing
- Error handling and validation

### 3. **Documentation** (`BUILD_IMPORT_GUIDE.md`)
- Complete usage guide
- JSON structure reference
- Best practices
- Troubleshooting

---

## 📦 Included Builds (6 Total)

| # | Build Name | Category | Role | Difficulty |
|---|------------|----------|------|------------|
| 1 | **Cursed Staff Plate** | Solo | Ganking/Burst | Medium |
| 2 | **Infernal Scythe** | PvP (5v5) | Hellgate DPS | Easy |
| 3 | **Faction Warfare Healer** | Large-Scale | Healer | Medium |
| 4 | **Bear Paws Gathering** | Group | Gathering | Easy |
| 5 | **Chillhowl ZvZ Tank** | Large-Scale | Tank | Hard |
| 6 | **Crossbow Escape** | Solo | Roaming | Medium |

---

## 🎯 Build Sources

These builds are based on:

1. **Cursed Staff Build**
   - Source: "The Easiest Life Curse Solo Ganking META in 2026"
   - Published: Feb 2026
   - Meta for: Solo black zone ganking

2. **Infernal Scythe**
   - Source: "This Oneshot Build is UNBEatable... in 5v5 Hellgates"
   - Published: Feb 2026
   - Meta for: 5v5 Hellgate burst

3. **Faction Warfare Healer**
   - Source: "This 100K Healer Build Will Make You Rich"
   - Published: Feb 2026
   - Meta for: Faction Warfare, ZvZ healing

4. **Bear Paws Gathering**
   - Based on community gathering meta
   - Standard high-yield gathering setup

5. **Chillhowl ZvZ Tank**
   - Source: Top Albion Online Tank Builds for 2026
   - Meta for: ZvZ engage/CC

6. **Crossbow Escape**
   - Based on solo roaming meta
   - High mobility escape build

---

## 🚀 How to Import

### Quick Start

```bash
# 1. Make sure you're in the project directory
cd "Z:\Projects\Apps\Mvp project\ao-pocket"

# 2. Run the import script
node scripts/import-builds.js
```

### Interactive Setup

The script will ask:
1. **Firebase User ID**: Your user ID from Firestore
2. **Display Name**: e.g., "AlbionKit Team" or your name
3. **Dry Run**: Test without saving (recommended first)

### Example Session

```
🎮 AlbionKit Build Import Script

⚠️  Please configure the script first.

Enter your Firebase User ID: abc123xyz456
Enter display name (default: AlbionKit Team): AlbionKit Team
Dry run mode? (yes/no, default: no): yes

📝 Target User ID: abc123xyz456
📝 Display Name: AlbionKit Team
🔍 Dry Run: ✅ YES (no changes will be made)

✅ Found user: AlbionKit Team

📖 Loading builds from: builds-import-2026.json
✅ Loaded 6 builds

🚀 Starting import...

[1/6] Importing: Cursed Staff Plate Solo PvP Build
  ✅ [DRY RUN] Would create build
[2/6] Importing: Infernal Scythe 5v5 Hellgate Build
  ✅ [DRY RUN] Would create build
...

📊 Import Summary
✅ Successful: 6
❌ Failed: 0
⚠️  Skipped: 0

💡 This was a dry run. No builds were actually saved.
   Set dryRun: false to import builds.
```

---

## 📊 Build Data Structure

Each build includes:

```json
{
  "title": "Build Name",
  "description": "Short description",
  "category": "solo",
  "authorName": "AlbionKit Team",
  "tags": ["PvP", "Solo"],
  "youtubeLink": "https://youtube.com/...",
  "strengths": ["High burst"],
  "weaknesses": ["Vulnerable to CC"],
  "mobility": "high",
  "difficulty": "medium",
  "items": {
    "MainHand": { "Type": "T8_2H_CURSEDSTAFF", "Quality": 3 },
    "Head": { "Type": "T8_PLATE_HELM", "Quality": 3 },
    ...
  }
}
```

---

## 🔧 Customization

### Add Your Own Builds

1. Edit `builds-import-2026.json`
2. Add new build objects to the `builds` array
3. Follow the existing structure
4. Run the import script

### Change Author

Update in `scripts/import-builds.js`:

```javascript
const CONFIG = {
  targetUserId: 'YOUR_USER_ID',
  targetUserName: 'Your Name',
  dryRun: false
};
```

---

## ✅ Pre-Import Checklist

Before running the import:

- [ ] Verify Firebase Admin credentials in `.env.local`
- [ ] Get your Firebase User ID from Firestore
- [ ] Test with dry run mode first (`dryRun: true`)
- [ ] Review builds in JSON file
- [ ] Backup existing builds (if needed)

---

## 📈 Post-Import

After successful import:

1. **Visit `/builds`** - See your imported builds
2. **Check categories** - Verify builds appear in correct sections
3. **Test filters** - Try tag filtering
4. **View build details** - Check equipment and descriptions

---

## 🎓 Next Steps

### Phase 1: Test Import
1. Run with `dryRun: true`
2. Verify no errors
3. Check console output

### Phase 2: Real Import
1. Set `dryRun: false`
2. Run import script
3. Verify in Firestore

### Phase 3: Verify in App
1. Visit `/builds`
2. Check each category
3. Test build views

### Phase 4: Add More Builds
1. Research latest meta builds
2. Extract item information
3. Add to JSON file
4. Re-import (script handles duplicates by creating new entries)

---

## 📝 Files Created

| File | Purpose |
|------|---------|
| `builds-import-2026.json` | Build data (6 meta builds) |
| `scripts/import-builds.js` | Import script |
| `BUILD_IMPORT_GUIDE.md` | Complete documentation |
| `BUILD_IMPORT_SUMMARY.md` | This summary |

---

## 🎯 Benefits

✅ **Time Saving**: No manual build creation  
✅ **Quality Content**: Curated meta builds  
✅ **SEO**: More indexed pages  
✅ **User Engagement**: Builds for all playstyles  
✅ **Easy Updates**: Just edit JSON and re-import  

---

## 🔍 Finding More Builds

To add more builds:

1. **YouTube Search**: "Albion Online [weapon] build 2026"
2. **Extract Items**: Watch video, note gear
3. **Find Item IDs**: Use Albion Wiki or in-game
4. **Add to JSON**: Follow existing format
5. **Import**: Run script again

---

## ⚠️ Important Notes

1. **Item IDs**: Must be exact (e.g., `T8_2H_CURSEDSTAFF`)
2. **Categories**: Must be valid (solo, pvp, zvz, etc.)
3. **User ID**: Must exist in Firestore
4. **Quality**: 0-4 scale (Normal to Masterpiece)

---

## 📞 Support

For issues:
1. Check `BUILD_IMPORT_GUIDE.md`
2. Review error messages
3. Verify Firebase credentials
4. Check Firestore directly

---

**Status**: ✅ **Ready to Import!**

Run `node scripts/import-builds.js` to get started! 🎮
