# Translation Guide

Help us make AlbionKit accessible to everyone by contributing translations!

## 🌍 Supported Languages

| Code | Language | Status |
|------|----------|--------|
| en | English | ✅ Complete |
| de | German | 🟡 In Progress |
| es | Spanish | 🟡 In Progress |
| fr | French | 🟡 In Progress |
| ko | Korean | 🟡 In Progress |
| pl | Polish | 🟡 In Progress |
| pt | Portuguese | 🟡 In Progress |
| ru | Russian | 🟡 In Progress |
| tr | Turkish | 🟡 In Progress |
| zh | Chinese | 🟡 In Progress |

## 📁 File Structure

Translation files are located in the `messages/` directory:

```
messages/
├── en.json          # English (base language)
├── de.json          # German
├── es.json          # Spanish
├── fr.json          # French
├── ko.json          # Korean
├── pl.json          # Polish
├── pt.json          # Portuguese
├── ru.json          # Russian
├── tr.json          # Turkish
└── zh.json          # Chinese
```

## 🔧 How to Contribute Translations

### Method 1: Translate Missing Keys (Recommended)

1. **Find your language file** in `messages/`

2. **Compare with English** (`messages/en.json`) to find missing keys

3. **Add translations** maintaining the JSON structure:

```json
{
  "Common": {
    "loading": "Loading...",      // English
    "loading": "Laden...",        // German example
    "save": "Save",
    "save": "Speichern"
  }
}
```

4. **Test your translations** by running the app:
   ```bash
   npm run dev
   ```

5. **Submit a Pull Request** with only translation changes

### Method 2: Add a New Language

1. **Create a new file** `messages/xx.json` (xx = language code)

2. **Copy the structure** from `messages/en.json`

3. **Translate all keys** maintaining the exact same structure

4. **Update i18n configuration**:
   
   Edit `src/i18n/request.ts`:
   ```typescript
   export const locales = ['en', 'de', 'es', 'fr', 'ko', 'pl', 'pt', 'ru', 'tr', 'zh', 'xx'];
   ```

5. **Add language selector** if needed

6. **Submit a Pull Request**

## 📝 Translation Guidelines

### Do's

✅ **Maintain context** - Understand where the text appears
✅ **Keep consistency** - Use the same terms throughout
✅ **Preserve placeholders** - Keep `{variable}` and `{count}` intact
✅ **Test in context** - Run the app to see translations in UI
✅ **Use natural language** - Avoid literal/awkward translations

### Don'ts

❌ **Don't modify keys** - Only change values
❌ **Don't remove keys** - Even if you don't know the translation
❌ **Don't translate code** - Only translate string values
❌ **Don't mix languages** - Keep each file in one language
❌ **Don't use machine translation blindly** - Review for accuracy

## 🎯 Key Translation Areas

### Common UI Elements

```json
{
  "Common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import"
  }
}
```

### Navigation

```json
{
  "Navigation": {
    "home": "Home",
    "tools": "Tools",
    "builds": "Builds",
    "profits": "Profits",
    "settings": "Settings"
  }
}
```

### Tool-Specific

Each tool has its own section:
- `MarketFlipper` - Market flipper tool
- `PvpIntel` - PvP intelligence
- `ZvZTracker` - ZvZ tracker
- `Crafting` - Crafting calculator
- etc.

## 🧪 Testing Translations

### 1. Check for Missing Keys

Run the translation check script:
```bash
npm run i18n:check
```

This will show:
- Missing keys in your language
- Extra keys that don't exist in English
- Formatting errors

### 2. Test in Browser

1. Start the dev server: `npm run dev`
2. Change language in the UI
3. Navigate through all pages
4. Check for:
   - Missing translations (shows English fallback)
   - Text overflow (translations too long)
   - Broken layouts
   - Incorrect context

### 3. Common Issues

**Text Overflow:**
- If translation is too long, try shorter alternatives
- Some UI elements have fixed widths

**Context Issues:**
- Some words have multiple meanings
- Check where the text appears in the UI
- Ask for clarification if unsure

## 📊 Translation Status

### Progress Tracking

We track translation completion:

- 🟢 **Complete** (95-100%) - All keys translated
- 🟡 **In Progress** (50-94%) - Partial translations
- 🔴 **Needs Work** (<50%) - Many missing translations

### Priority Languages

Currently prioritizing:
1. German (de) - Large player base
2. Russian (ru) - Active community
3. Portuguese (pt) - Growing region
4. French (fr) - Requested feature

## 🛠️ Tools and Resources

### Translation Files

- **Base file:** `messages/en.json` (always up to date)
- **Target files:** `messages/[lang].json`

### Helpful Tools

- **VS Code** - JSON syntax highlighting
- **JSONLint** - Validate JSON format
- **DeepL** - Machine translation (use as reference only)
- **Albion Online** - In-game terms reference

### Albion-Specific Terms

Some terms should remain consistent with the game:

| English | Note |
|---------|------|
| Silver | Keep as "Silver" or use official translation |
| Gold | Keep as "Gold" or use official translation |
| Fame | Use official game translation |
| IP (Item Power) | Keep as IP or translate fully |
| ZvZ | Keep as "ZvZ" (Zone vs Zone) |

Check the official Albion Online localization for consistency.

## 🤝 Questions?

- Open an issue for translation questions
- Join Discord #translations channel
- Check existing translations for reference

## 🏆 Recognition

Translators are credited in:
- README.md
- Release notes
- Discord translator role

Thank you for helping make AlbionKit accessible worldwide! 🌍
