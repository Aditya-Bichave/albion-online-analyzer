# Open Graph Image Strategy - Clear Separation

**Date:** March 24, 2026  
**Approach:** Hybrid (Both Methods)  
**Goal:** No overlap, clear responsibilities

---

## 📋 Separation Strategy

### **Method 1: Screenshot Images** (Static Pages)
**Use For:** Pages with fixed content that show UI/tools

**Pages:**
- ✅ Homepage (`/`)
- ✅ About (`/about`)
- ✅ All Tools (`/tools/*`)
- ✅ All Profit Calculators (`/profits/*`)
- ✅ Builds List (`/builds`)
- ✅ Settings (`/settings`)
- ✅ Login (`/login`)
- ✅ Forum List (`/forum`)

**Why:** 
- Shows actual UI
- Pre-generated (fast)
- Consistent branding

---

### **Method 2: Dynamic OG Images** (Dynamic Pages)
**Use For:** Pages with user-generated/dynamic content

**Pages:**
- ✅ Build Details (`/builds/[id]`) - Shows build title, category
- ✅ User Profiles (`/user/[userId]`) - Shows username, stats
- ✅ Forum Threads (`/forum/thread/[id]`) - Shows thread title

**Why:**
- Personalized content
- Dynamic data
- Unique per page

---

## 🎯 Clear Responsibilities

### `opengraph-image.tsx` Files
**Location:** Dynamic routes only
**Purpose:** Generate personalized images
**Data Source:** Page params, database

**Files:**
```
✅ KEEP: /app/builds/[id]/opengraph-image.tsx
✅ KEEP: /app/user/[userId]/opengraph-image.tsx (create if needed)
✅ KEEP: /app/forum/thread/[id]/opengraph-image.tsx (create if needed)
❌ REMOVE: /app/opengraph-image.tsx (homepage uses screenshot)
```

### Screenshot Metadata
**Location:** Static routes
**Purpose:** Show UI previews
**Data Source:** Pre-generated screenshots

**Files:**
```
✅ USE: /screenshots/tools/*.png
✅ USE: /screenshots/profits/*.png
✅ USE: /screenshots/misc/*.png
✅ USE: /screenshots/builds/*.png
```

---

## 🔧 Implementation

### For Static Pages (Screenshot Method)
```typescript
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata = createPageMetadata(
  'market-flipper',  // References screenshot
  'Market Flipper',
  'Description...'
);
```

### For Dynamic Pages (OG Image Method)
```typescript
// Next.js automatically uses opengraph-image.tsx
// No metadata needed for images!

export async function generateMetadata({ params }: Props) {
  const build = await getBuild(params.id);
  
  return {
    title: `${build.title} - AlbionKit`,
    description: build.description,
    // NO images property - Next.js uses opengraph-image.tsx
  };
}
```

---

## ⚠️ Avoid Overlap

### ❌ DON'T Do This
```typescript
// Static page with opengraph-image.tsx
export const metadata = {
  openGraph: {
    images: ['/screenshots/...'], // Conflicts with OG image
  }
};
```

### ✅ DO This Instead
```typescript
// Static page - use screenshots
export const metadata = createPageMetadata('market-flipper', ...);

// Dynamic page - let Next.js handle it
export async function generateMetadata({ params }) {
  return {
    title: 'Dynamic Title',
    // No images - opengraph-image.tsx handles it
  };
}
```

---

## 📁 File Organization

### Screenshot Files (Pre-generated)
```
public/screenshots/
├── tools/
│   ├── market-flipper.png
│   ├── kill-feed.png
│   └── ...
├── profits/
│   ├── farming-calc.png
│   └── ...
├── builds/
│   ├── builds-list.png
│   └── build-detail.png
└── misc/
    ├── homepage.png
    └── about.png
```

### Dynamic OG Image Files (Generated on-demand)
```
src/app/
├── builds/[id]/
│   └── opengraph-image.tsx ✅
├── user/[userId]/
│   └── opengraph-image.tsx ✅ (create)
└── forum/thread/[id]/
    └── opengraph-image.tsx ✅ (create)
```

### Removed (No longer needed)
```
src/app/
└── opengraph-image.tsx ❌ (delete - homepage uses screenshot)
```

---

## 🎯 Page-by-Page Guide

### Static Pages (Use Screenshots)

| Page | Screenshot Key | Status |
|------|----------------|--------|
| `/` | `homepage` | ✅ Using screenshot |
| `/about` | `about` | ✅ Using screenshot |
| `/tools/market-flipper` | `market-flipper` | ✅ Using screenshot |
| `/tools/kill-feed` | `kill-feed` | ✅ Using screenshot |
| `/tools/gold-price` | `gold-price` | ✅ Using screenshot |
| `/tools/crafting-calc` | `crafting-calc` | ✅ Using screenshot |
| `/tools/pvp-intel` | `pvp-intel` | ✅ Using screenshot |
| `/tools/zvz-tracker` | `zvz-tracker` | ✅ Using screenshot |
| `/profits/farming` | `farming-calc` | ✅ Using screenshot |
| `/profits/cooking` | `cooking-calc` | ✅ Using screenshot |
| `/profits/alchemy` | `alchemy-calc` | ✅ Using screenshot |
| `/profits/enchanting` | `enchanting-calc` | ✅ Using screenshot |
| `/profits/labour` | `labour-calc` | ✅ Using screenshot |
| `/profits/animal` | `animal-calc` | ✅ Using screenshot |
| `/profits/chopped-fish` | `chopped-fish-calc` | ✅ Using screenshot |
| `/builds` | `builds-list` | ✅ Using screenshot |
| `/forum` | `forum-list` | ✅ Using screenshot |
| `/settings` | `settings` | ✅ Using screenshot |
| `/login` | `login` | ✅ Using screenshot |

### Dynamic Pages (Use OG Image Generator)

| Page | OG Image File | Status |
|------|---------------|--------|
| `/builds/[id]` | `builds/[id]/opengraph-image.tsx` | ✅ Exists |
| `/user/[userId]` | `user/[userId]/opengraph-image.tsx` | ⚠️ Create |
| `/forum/thread/[id]` | `forum/thread/[id]/opengraph-image.tsx` | ⚠️ Create |

---

## 🔍 How Next.js Handles This

### Static Pages
```typescript
// Next.js sees metadata.images and uses those
export const metadata = {
  openGraph: {
    images: ['/screenshots/...'] // ✅ Uses this
  }
};
```

### Dynamic Pages
```typescript
// Next.js finds opengraph-image.tsx and uses it
// No images in metadata needed!
export async function generateMetadata({ params }) {
  return {
    title: 'Dynamic Title'
    // No images - Next.js auto-generates from opengraph-image.tsx
  };
}
```

---

## ✅ Verification Checklist

### For Static Pages
- [ ] Uses `createPageMetadata()` helper
- [ ] Has screenshot in `/public/screenshots/`
- [ ] Metadata includes `images` array
- [ ] NO `opengraph-image.tsx` file in route

### For Dynamic Pages
- [ ] Has `opengraph-image.tsx` file in route
- [ ] NO `images` in metadata
- [ ] Generates image dynamically with params/data

---

## 🎯 Benefits of This Approach

### Performance
- **Static pages:** Instant (pre-generated images)
- **Dynamic pages:** On-demand (generated when needed)
- **Caching:** Both methods cache well

### SEO
- **Static pages:** Consistent images, optimized alt text
- **Dynamic pages:** Personalized, relevant content
- **No conflicts:** Clear separation prevents issues

### Maintenance
- **Static pages:** Update screenshot, done
- **Dynamic pages:** Update template, all pages updated
- **Clear ownership:** Know which method each page uses

---

## 📝 Next Steps

### Immediate
1. ✅ Document strategy (this file)
2. ✅ Verify all static pages use screenshots
3. ⚠️ Create `user/[userId]/opengraph-image.tsx`
4. ⚠️ Create `forum/thread/[id]/opengraph-image.tsx`
5. ❌ Delete root `/app/opengraph-image.tsx`

### Testing
1. Test static pages with Facebook Debugger
2. Test dynamic pages with Twitter Validator
3. Verify no overlap/conflicts
4. Check image quality on all pages

---

**Status:** ✅ Strategy Defined  
**Static Pages:** ✅ All configured  
**Dynamic Pages:** ⚠️ Need OG image files  
**Conflicts:** ❌ None

---

**Last Updated:** March 24, 2026  
**Next Review:** After creating dynamic OG image files
