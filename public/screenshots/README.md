# 📸 Screenshot Quick Reference

**Created:** March 24, 2026  
**For:** Albion Online Analyzer SEO Screenshots

---

## 📁 Directory Structure

```
public/screenshots/
├── builds/          (2 files)
├── tools/           (6 files)
├── profits/         (7 files)
├── forum/           (2 files)
├── user/            (2 files)
├── misc/            (3 files)
└── screenshots.json (metadata)
```

**Total: 24 screenshots**

---

## ✅ Checklist

### Misc (3)
- [ ] `misc/homepage.png`
- [ ] `misc/login.png`
- [ ] `misc/about.png`

### Builds (2)
- [ ] `builds/builds-list.png`
- [ ] `builds/build-detail.png`

### Tools (6)
- [ ] `tools/market-flipper.png`
- [ ] `tools/kill-feed.png`
- [ ] `tools/gold-price.png`
- [ ] `tools/crafting-calc.png`
- [ ] `tools/pvp-intel.png`
- [ ] `tools/zvz-tracker.png`

### Profits (7)
- [ ] `profits/farming-calc.png`
- [ ] `profits/cooking-calc.png`
- [ ] `profits/alchemy-calc.png`
- [ ] `profits/animal-calc.png`
- [ ] `profits/chopped-fish-calc.png`
- [ ] `profits/enchanting-calc.png`
- [ ] `profits/labour-calc.png`

### Forum (2)
- [ ] `forum/forum-list.png`
- [ ] `forum/thread-detail.png`

### User (2)
- [ ] `user/profile.png`
- [ ] `user/settings.png`

---

## 🔧 How to Take Screenshots

### Chrome DevTools (Recommended)
```
1. Press F12
2. Press Ctrl+Shift+P
3. Type "screenshot"
4. Select "Capture full size screenshot"
5. Save to correct folder
```

### Specifications
- **Format:** PNG
- **Resolution:** 1920x1080
- **File Size:** < 500KB
- **Browser:** Chrome (incognito mode)

---

## 📝 Naming Convention

```
✅ Good:
market-flipper.png
zvz-tracker.png

❌ Bad:
screenshot1.png
IMG_20260324.png
```

---

## 💻 Add to Page (3 Lines)

```typescript
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata = createPageMetadata(
  'market-flipper',  // Screenshot key
  'Page Title',
  'Page description...'
);
```

---

## 🔗 Screenshot Keys Reference

| Category | Keys |
|----------|------|
| **Tools** | `market-flipper`, `kill-feed`, `gold-price`, `crafting-calc`, `pvp-intel`, `zvz-tracker` |
| **Profits** | `farming-calc`, `cooking-calc`, `alchemy-calc`, `animal-calc`, `chopped-fish-calc`, `enchanting-calc`, `labour-calc` |
| **Builds** | `builds-list`, `build-detail` |
| **Forum** | `forum-list`, `thread-detail` |
| **User** | `user-profile`, `settings` |
| **Misc** | `homepage`, `login`, `about` |

---

## 🌐 Test Your Work

### Social Media Preview Testers
- **Facebook:** https://developers.facebook.com/tools/debug/
- **Twitter:** https://cards-dev.twitter.com/validator
- **LinkedIn:** https://www.linkedin.com/post-inspector/

### What to Check
- ✅ Image loads correctly
- ✅ Alt text is descriptive
- ✅ Dimensions are 1920x1080
- ✅ File size is under 500KB

---

## 📚 Documentation

- **Full Guide:** `docs/SEO_SCREENSHOTS_GUIDE.md`
- **Metadata Helper:** `src/lib/screenshot-metadata.ts`
- **Examples:** `src/app/EXAMPLE_SCREENSHOT_USAGE.tsx`
- **Metadata JSON:** `public/screenshots/screenshots.json`

---

## 🚀 Quick Start

1. **Take screenshot** (Chrome DevTools)
2. **Save to folder** (e.g., `public/screenshots/tools/market-flipper.png`)
3. **Add to page** (3 lines of code)
4. **Test** (Facebook Debugger)
5. **Done!** ✅

---

## 📞 Need Help?

See `docs/SEO_SCREENSHOTS_GUIDE.md` for detailed instructions.

---

**Last Updated:** March 24, 2026
