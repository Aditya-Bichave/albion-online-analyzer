# Performance Optimization Plan

Based on Vercel CPU usage analysis, here are the critical optimizations needed:

---

## ✅ IMPLEMENTED OPTIMIZATIONS

### **1. Kill Feed (`/tools/kill-feed`) - 1.4K calls, 3min CPU 🔴**

#### ✅ A. Removed Live Metadata API Call
**File:** `src/app/tools/kill-feed/page.tsx`
- **Before:** `generateMetadata()` called `fetchRecentEvents()` on every page request
- **After:** Uses static description from translations
- **Impact:** ~40-50% CPU reduction for this route

#### ✅ B. Added ISR to Kill Feed Page
**File:** `src/app/tools/kill-feed/page.tsx`
```tsx
export const revalidate = 30; // Revalidate every 30 seconds
```

#### ✅ C. Reduced Client Polling Frequency
**File:** `src/app/tools/kill-feed/KillFeedClient.tsx`
- **Before:** 10 second polling interval
- **After:** 30 second polling interval
- **Impact:** 66% fewer client-side requests

---

### **2. Market Flipper (`/tools/market-flipper`) - 752 calls, 49s CPU 🟡**

#### ✅ A. Added localStorage Caching for Items Database
**File:** `src/lib/item-service.ts`
- Caches raw items data in localStorage for 1 hour
- Prevents refetching 2000+ item database on repeat visits
- **Impact:** Significant reduction in bandwidth and CPU for returning users

#### ✅ B. Increased Market Data Cache Duration
**File:** `src/lib/market-service.ts`
- **Prices:** 60s → 120s cache (2x reduction)
- **Volume:** 300s → 600s cache (2x reduction)

---

### **3. GameInfo Proxy API (`/api/proxy/gameinfo/events`) - 2K calls, 51s CPU 🟡**

#### ✅ A. Added Next.js Caching
**File:** `src/app/api/proxy/gameinfo/events/route.ts`
```tsx
next: { revalidate: 10 } // 10 second cache
```

#### ✅ B. Added Edge Cache Headers
```tsx
headers: {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30'
}
```
- **Impact:** Vercel edge network caches responses, reducing origin CPU

---

## 📊 Expected CPU Reduction

| Optimization | Estimated CPU Savings |
|-------------|----------------------|
| Kill Feed metadata fix | ~40-50% |
| Kill Feed polling reduction (10s → 30s) | ~20-25% |
| Market flipper localStorage cache | ~15-20% |
| Market data cache increase | ~10-15% |
| Proxy API edge caching | ~15-25% |
| **Total Expected** | **~70-85% reduction** |

---

## 📋 Files Modified

1. ✅ `src/app/tools/kill-feed/page.tsx` - Static metadata + ISR
2. ✅ `src/app/tools/kill-feed/KillFeedClient.tsx` - Reduced polling
3. ✅ `src/app/api/proxy/gameinfo/events/route.ts` - Added caching
4. ✅ `src/lib/item-service.ts` - localStorage caching
5. ✅ `src/lib/market-service.ts` - Increased cache duration

---

## 🔍 Additional Recommendations (Future)

### Phase 2 (If more optimization needed)

1. **Implement Request Deduplication**
   - Prevent concurrent identical requests
   - Use `@vercel/kv` for distributed caching

2. **Lazy Load Heavy Components**
   - Code split market history charts
   - Lazy load kill feed equipment details

3. **Optimize Images**
   - Use `next/image` with proper sizing
   - Add `loading="lazy"` for below-fold content

4. **Add Analytics Monitoring**
   - Track actual API call reduction
   - Monitor cache hit rates

---

## 🧪 Testing Checklist

- [ ] Kill Feed page loads correctly with static metadata
- [ ] Market Flipper shows items from cache on second load
- [ ] Proxy API returns cached data (check headers)
- [ ] No console errors from localStorage operations
- [ ] Polling interval change doesn't break UX
- [ ] Monitor Vercel CPU usage after deployment
