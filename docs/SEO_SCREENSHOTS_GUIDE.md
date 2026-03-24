# AlbionKit Screenshot Guide

**Created:** March 24, 2026  
**Purpose:** SEO-optimized screenshots for all pages  
**Directory:** `public/screenshots/`

---

## 📁 Directory Structure

```
public/screenshots/
├── builds/
│   ├── builds-list.png
│   └── build-detail.png
├── tools/
│   ├── market-flipper.png
│   ├── kill-feed.png
│   ├── gold-price.png
│   ├── crafting-calc.png
│   ├── pvp-intel.png
│   └── zvz-tracker.png
├── profits/
│   ├── farming-calc.png
│   ├── cooking-calc.png
│   ├── alchemy-calc.png
│   ├── animal-calc.png
│   ├── chopped-fish-calc.png
│   ├── enchanting-calc.png
│   └── labour-calc.png
├── forum/
│   ├── forum-list.png
│   └── thread-detail.png
├── user/
│   ├── profile.png
│   └── settings.png
├── misc/
│   ├── homepage.png
│   ├── login.png
│   └── about.png
└── screenshots.json (metadata file)
```

---

## ✅ Screenshot Checklist

### Homepage & Core Pages
- [ ] `/` - Homepage (hero section, features)
- [ ] `/about` - About page
- [ ] `/login` - Login modal/page
- [ ] `/cookies` - Cookies policy (if needed)
- [ ] `/privacy` - Privacy policy (if needed)
- [ ] `/terms` - Terms of service (if needed)

### Builds Section
- [ ] `/builds` - Builds list with filters
- [ ] `/builds/[id]` - Individual build detail (pick a popular one)

### Tools (6 pages)
- [ ] `/tools/market-flipper` - Market flipper interface
- [ ] `/tools/kill-feed` - Live kill feed
- [ ] `/tools/gold-price` - Gold price calculator
- [ ] `/tools/crafting-calc` - Crafting calculator
- [ ] `/tools/pvp-intel` - PvP intel dashboard
- [ ] `/tools/zvz-tracker` - ZvZ battle tracker

### Profit Calculators (7 pages)
- [ ] `/profits/farming` - Farming calculator
- [ ] `/profits/cooking` - Cooking calculator
- [ ] `/profits/alchemy` - Alchemy calculator
- [ ] `/profits/animal` - Animal husbandry calculator
- [ ] `/profits/chopped-fish` - Chopped fish calculator
- [ ] `/profits/enchanting` - Enchanting calculator
- [ ] `/profits/labour` - Laborers calculator

### Community
- [ ] `/forum` - Forum main page
- [ ] `/forum/thread/[id]` - Thread detail (pick an active one)

### User
- [ ] `/user/[userId]` - User profile (your profile or a demo)
- [ ] `/settings` - Settings page

**Total: 24 screenshots**

---

## 📸 Screenshot Best Practices

### Technical Specifications

| Property | Recommendation |
|----------|---------------|
| **Format** | PNG (lossless) or WebP (smaller) |
| **Resolution** | 1920x1080 (Full HD) or 1280x720 (HD) |
| **File Size** | Under 500KB each |
| **Color Profile** | sRGB |
| **Browser** | Chrome or Firefox (latest version) |

### Composition Tips

1. **Show Key Features**
   - Include data/numbers (profits, kills, etc.)
   - Show interactive elements (buttons, filters)
   - Capture "active" states (not empty pages)

2. **Clean Screenshots**
   - Hide browser chrome (address bar, bookmarks)
   - Use incognito mode to avoid personal data
   - Clear bookmarks bar
   - Disable extensions that show UI

3. **Consistent Style**
   - Same browser window size for all
   - Similar scroll positions
   - Consistent lighting/time of day
   - Same theme (dark mode if that's your default)

4. **Show Value**
   - For calculators: Show input + results
   - For lists: Show populated data
   - For dashboards: Show charts/graphs

---

## 🛠️ Tools for Taking Screenshots

### Free Tools

1. **Browser DevTools** (Recommended)
   ```
   Chrome: F12 → Ctrl+Shift+P → "Screenshot"
   Firefox: F12 → Three dots → "Take Screenshot"
   ```

2. **Full Page Screen Capture** (Chrome Extension)
   - Captures entire scrollable page
   - Auto-saves as PNG

3. **ShareX** (Windows)
   - Free, open-source
   - Scroll capture feature
   - Auto-save with naming

4. **Greenshot** (Windows)
   - Lightweight
   - Quick annotations

### Premium Tools

1. **CleanShot X** (Mac)
   - Beautiful screenshots
   - Auto-upload

2. **Snagit** (Windows/Mac)
   - Scroll capture
   - Annotations
   - Video recording

---

## 🎨 How to Take Screenshots (Step-by-Step)

### Method 1: Chrome DevTools (Best Quality)

1. **Open DevTools**
   - Press `F12` or `Ctrl+Shift+I`
   - Or right-click → Inspect

2. **Open Command Menu**
   - Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)

3. **Search for Screenshot**
   - Type "screenshot"
   - Select one of:
     - **Capture area screenshot** - Select region
     - **Capture full size screenshot** - Entire page (recommended)
     - **Capture node screenshot** - Specific element
     - **Capture screenshot** - Visible viewport

4. **Save the File**
   - Auto-downloads to your Downloads folder
   - Rename according to structure

### Method 2: Responsive Design Mode

1. **Open DevTools** (`F12`)
2. **Toggle Device Toolbar** (`Ctrl+Shift+M`)
3. **Set dimensions to 1920x1080**
4. **Navigate to page**
5. **Use DevTools screenshot** (Method 1)

### Method 3: Browser Extension

1. Install **Full Page Screen Capture**
2. Navigate to page
3. Click extension icon
4. Download and save

---

## 📝 Naming Convention Examples

### ✅ Good Names
```
market-flipper.png
zvz-tracker.png
builds-database.png
farming-calculator.png
```

### ❌ Bad Names
```
screenshot1.png
IMG_20260324_103000.png
Screen Shot 2026-03-24 at 10.30.00 AM.png
albionkit-market-tool-final-v2.png
```

---

## 🚀 After Taking Screenshots

### 1. Save to Correct Location
```bash
# Example file locations
public/screenshots/tools/market-flipper.png
public/screenshots/profits/farming-calc.png
public/screenshots/builds/builds-list.png
```

### 2. Optimize File Size (Optional)
```bash
# Using ImageMagick (free)
convert input.png -quality 85 output.png

# Using Squoosh (web)
https://squoosh.app/
```

### 3. Update Page Metadata
See the next section for how to add screenshots to your pages.

---

## 🔧 Integration with Next.js

### Update Page Metadata

Add this to each page's `metadata` export:

```typescript
// Example: src/app/tools/market-flipper/page.tsx
export const metadata = {
  title: 'Market Flipper - AlbionKit',
  description: 'Find profitable market flips in real-time...',
  openGraph: {
    title: 'Market Flipper - AlbionKit',
    description: 'Find profitable market flips in real-time...',
    images: [
      {
        url: '/screenshots/tools/market-flipper.png',
        width: 1920,
        height: 1080,
        alt: 'AlbionKit Market Flipper Tool showing real-time profits'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Market Flipper - AlbionKit',
    description: 'Find profitable market flips in real-time...',
    images: ['/screenshots/tools/market-flipper.png']
  }
};
```

### Bulk Update Script (Optional)

Create a script to auto-update all pages:

```javascript
// scripts/update-screenshots.js
const fs = require('fs');
const path = require('path');

const screenshots = require('../public/screenshots/screenshots.json');

Object.entries(screenshots).forEach(([key, data]) => {
  console.log(`${key}: ${data.page}`);
  // Add logic to update page files
});
```

---

## 📊 SEO Benefits

### Why Screenshots Help SEO

1. **Social Sharing**
   - Better click-through rates on social media
   - Open Graph images increase engagement

2. **Google Images**
   - Appear in Google Image Search
   - Drive additional organic traffic

3. **User Experience**
   - Users know what to expect
   - Reduced bounce rates

4. **Rich Snippets**
   - Enhanced search results
   - Visual appeal in SERPs

---

## 🎯 Screenshot Content Guide

### What to Show on Each Page

#### Homepage (`/`)
- Hero section with main value proposition
- Feature highlights
- Live data if possible (active users, recent kills)

#### Market Flipper (`/tools/market-flipper`)
- Show profitable flips (green numbers)
- Multiple cities comparison
- Filters and search visible

#### Kill Feed (`/tools/kill-feed`)
- Active kill feed with recent kills
- Player names and fame values
- Server selector visible

#### ZvZ Tracker (`/tools/zvz-tracker`)
- Live or recent battles
- Guild names and stats
- Battle details expanded

#### Builds List (`/builds`)
- Multiple build cards visible
- Filters applied (show active state)
- Sort options visible

#### Build Detail (`/builds/[id]`)
- Full equipment display
- Stats and details
- Comments/ratings section

#### Profit Calculators
- Calculator with values entered
- Results/profits visible
- Focus optimization shown

---

## 🌐 International Considerations

If you support multiple languages:

1. **Take screenshots in English** (primary)
2. **Optional:** Take screenshots in other major languages
3. **Organize by language:**
   ```
   public/screenshots/
   ├── en/
   ├── de/
   ├── fr/
   └── es/
   ```

---

## 📱 Mobile Screenshots (Optional)

For mobile SEO:

```
public/screenshots/mobile/
├── homepage-mobile.png
├── market-flipper-mobile.png
└── ...
```

**Dimensions:** 390x844 (iPhone 14 Pro) or 375x667 (iPhone SE)

---

## ✅ Quality Checklist

Before finalizing screenshots:

- [ ] No personal data visible (emails, private builds)
- [ ] No browser UI (address bar, extensions)
- [ ] All text is readable
- [ ] Images are sharp (not blurry)
- [ ] Colors are accurate
- [ ] File sizes are optimized (<500KB)
- [ ] Names follow convention
- [ ] Metadata is updated in pages
- [ ] Screenshots show actual functionality (not loading states)

---

## 🔄 Maintenance

### When to Update Screenshots

- Major UI redesign
- New features added
- Old data looks outdated
- Seasonal updates (optional)

### Review Schedule

- **Monthly:** Check for outdated data
- **Quarterly:** Update if needed
- **After major releases:** Always update

---

## 📞 Need Help?

For questions about screenshots:
1. Check this guide first
2. Review `screenshots.json` for metadata examples
3. See existing screenshots for reference

---

**Last Updated:** March 24, 2026  
**Next Review:** After next major UI update
