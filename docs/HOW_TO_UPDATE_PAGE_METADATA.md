# How to Update Page Metadata with Screenshots

**Quick Guide** - 2 minutes per page

---

## Step-by-Step Instructions

### Step 1: Add Import (Line 1-5)

Add this import at the top of your page.tsx file:

```typescript
import { createPageMetadata } from '@/lib/screenshot-metadata';
```

---

### Step 2: Create Base Metadata (Before generateMetadata)

Add this constant before your `generateMetadata` function:

```typescript
// Base metadata with screenshot
const baseMetadata = createPageMetadata(
  'screenshot-key',  // From screenshots.json
  'Page Title',
  'Page description...'
);
```

---

### Step 3: Update generateMetadata Function

Replace the return statement to use baseMetadata:

```typescript
export async function generateMetadata(): Promise<Metadata> {
  // Your existing code...
  
  return {
    ...baseMetadata,  // Spread base metadata
    title,           // Override with dynamic values
    description,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      description,
      url: 'https://albionkit.com/tools/your-page',
    },
    twitter: {
      ...baseMetadata.twitter,
      title,
      description,
    }
  };
}
```

---

### Step 4: Remove Old Image References

Delete these lines:
```typescript
images: ['https://albionkit.com/og-image.jpg'],  // ❌ Remove
```

---

## Complete Example

### Before (Old Code)
```typescript
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Market Flipper',
    openGraph: {
      images: ['https://albionkit.com/og-image.jpg'], // Generic
    },
  };
}
```

### After (New Code with Screenshot)
```typescript
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/screenshot-metadata';

const baseMetadata = createPageMetadata(
  'market-flipper',  // Uses organized screenshot
  'Market Flipper - AlbionKit',
  'Find profitable market flips...'
);

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...baseMetadata,
    openGraph: {
      ...baseMetadata.openGraph,
      url: 'https://albionkit.com/tools/market-flipper',
    },
  };
}
```

---

## Screenshot Keys Reference

### Tools
```typescript
'market-flipper'
'kill-feed'
'gold-price'
'crafting-calc'
'pvp-intel'
'zvz-tracker'
```

### Profits
```typescript
'farming-calc'
'cooking-calc'
'alchemy-calc'
'enchanting-calc'
'labour-calc'
'animal-calc'
'chopped-fish-calc'
```

### Builds
```typescript
'builds-list'
'build-detail'
```

### Misc
```typescript
'homepage'
'login'
'about'
```

---

## Quick Updates (Copy-Paste Templates)

### Template 1: Static Page (No dynamic metadata)

```typescript
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/screenshot-metadata';

export const metadata = createPageMetadata(
  'market-flipper',
  'Market Flipper - AlbionKit',
  'Find profitable market flips in real-time...'
);

export default function Page() {
  return <YourComponent />;
}
```

### Template 2: Dynamic Page (With translations)

```typescript
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { createPageMetadata } from '@/lib/screenshot-metadata';

const baseMetadata = createPageMetadata(
  'kill-feed',
  'Kill Feed - AlbionKit',
  'Live PvP kill feed...'
);

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Pages.killFeed');
  
  return {
    ...baseMetadata,
    title: t('title'),
    openGraph: {
      ...baseMetadata.openGraph,
      url: 'https://albionkit.com/tools/kill-feed',
    },
  };
}
```

### Template 3: Dynamic Page (With searchParams)

```typescript
import { Metadata } from 'next';
import { createPageMetadata } from '@/lib/screenshot-metadata';

const baseMetadata = createPageMetadata(
  'market-flipper',
  'Market Flipper - AlbionKit',
  'Find profitable market flips...'
);

type Props = {
  searchParams: Promise<{ [key: string]: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const item = params?.item;
  
  let title = 'Market Flipper';
  if (item) title = `${item} - Market Flipper`;
  
  return {
    ...baseMetadata,
    title,
    openGraph: {
      ...baseMetadata.openGraph,
      title,
      url: 'https://albionkit.com/tools/market-flipper',
    },
  };
}
```

---

## Checklist for Each Page

- [ ] Added `import { createPageMetadata }`
- [ ] Created `baseMetadata` constant
- [ ] Updated `generateMetadata` to spread `baseMetadata`
- [ ] Removed old `images: ['...og-image.jpg']` lines
- [ ] Added canonical URL in openGraph
- [ ] Build succeeds (`npm run build`)
- [ ] Tested with Facebook Debugger

---

## Priority Order

### Update These First (High Traffic)
1. `/tools/market-flipper/page.tsx` ✅ DONE
2. `/tools/kill-feed/page.tsx` ✅ DONE
3. `/builds/page.tsx`
4. `/tools/zvz-tracker/page.tsx`
5. `/tools/pvp-intel/page.tsx`

### Then These (Medium Traffic)
6. `/profits/farming/page.tsx`
7. `/profits/cooking/page.tsx`
8. `/tools/gold-price/page.tsx`
9. `/tools/crafting-calc/page.tsx`
10. `/page.tsx` (homepage)

### Finally (Lower Traffic)
11-20. Remaining calculator and forum pages

---

## Testing

### After updating each page:

1. **Build Test**
   ```bash
   npm run build
   ```

2. **Facebook Debugger**
   - Go to: https://developers.facebook.com/tools/debug/
   - Enter your page URL
   - Check if screenshot shows

3. **Twitter Card Validator**
   - Go to: https://cards-dev.twitter.com/validator
   - Check if screenshot shows

4. **Visual Check**
   - Open page in browser
   - Share to social media (test)
   - Verify image loads

---

## Common Issues & Solutions

### Issue: "Module not found"
```
Error: Cannot find module '@/lib/screenshot-metadata'
```

**Solution:** Make sure the import is at the top:
```typescript
import { createPageMetadata } from '@/lib/screenshot-metadata';
```

---

### Issue: "Property does not exist on type"
```
Error: Property 'openGraph' does not exist on type 'Metadata'
```

**Solution:** Make sure you're spreading correctly:
```typescript
return {
  ...baseMetadata,  // ✅ Correct
  title: 'My Title'
}
```

---

### Issue: Build succeeds but image doesn't show

**Solution:**
1. Check image exists in `public/screenshots/`
2. Clear browser cache
3. Use Facebook Debugger to force refresh
4. Check image dimensions (should be 1920x1080)

---

## Rollback (If Needed)

If something breaks, simply revert to:

```typescript
export const metadata: Metadata = {
  title: 'Page Title',
  openGraph: {
    images: ['/og-image.jpg'], // Fallback
  },
};
```

All changes are non-breaking.

---

## Time Estimate

- **Per Page:** 2-3 minutes
- **20 Pages:** 40-60 minutes
- **Testing:** 30 minutes
- **Total:** ~1.5 hours

---

## Done? ✅

After updating all pages:
1. Run full build: `npm run build`
2. Test 3-4 random pages with Facebook Debugger
3. Update `docs/SCREENSHOT_METADATA_STATUS.md`
4. Celebrate! 🎉

---

**Questions?** See `docs/SEO_SCREENSHOTS_GUIDE.md` for full details
