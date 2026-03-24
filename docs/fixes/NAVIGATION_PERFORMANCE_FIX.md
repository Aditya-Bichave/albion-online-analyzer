# Navigation Performance Fixes

**Date:** March 24, 2026  
**Issue:** Pages take long to respond when clicking navigation links  
**Symptoms:** Delayed navigation, slow page transitions, loading lag

---

## Problems Identified

### 1. **Missing `startTransition` for Navigation**
When clicking navigation links, React doesn't know the update can be deferred, causing blocking renders.

### 2. **No Loading State Feedback**
Users don't get immediate feedback that their click was registered.

### 3. **Heavy Components Rendering on Every Route Change**
Navbar and layout components re-render completely on every navigation.

### 4. **Firestore Queries Blocking Navigation**
Auth profile checks happening synchronously during navigation.

---

## Solutions

### Solution 1: Add `useTransition` to Navigation

**File:** `src/components/navbar.tsx`

```typescript
import { useTransition } from 'react';

// In component:
const [isPending, startTransition] = useTransition();

// Update navigation handlers:
const handleNavClick = (href: string) => {
  startTransition(() => {
    router.push(href);
  });
};
```

**Benefits:**
- Non-blocking navigation
- UI remains responsive during transition
- Better perceived performance

---

### Solution 2: Optimize Auth Context

**File:** `src/context/AuthContext.tsx`

**Current Issue:**
```typescript
const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    await ensureProfileExists(firebaseUser);  // Blocking
    const userProfile = await getUserProfile(firebaseUser.uid);  // Blocking
    setProfile(userProfile);
  }
});
```

**Fix:**
```typescript
const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  setUser(firebaseUser);
  setLoading(false);  // Don't wait for profile
  
  // Fetch profile in background
  if (firebaseUser) {
    ensureProfileExists(firebaseUser).catch(console.error);
    getUserProfile(firebaseUser.uid)
      .then(profile => {
        if (isMounted.current) setProfile(profile);
      })
      .catch(console.error);
  }
});
```

**Benefits:**
- Navigation doesn't wait for profile load
- Profile appears when ready
- Faster initial navigation

---

### Solution 3: Memoize Navbar

**File:** `src/components/navbar.tsx`

```typescript
export const Navbar = React.memo(() => {
  // Component code
});
```

**Add useMemo for computed values:**
```typescript
const displayName = useMemo(() => 
  profile?.displayName || user?.displayName || 'User',
  [profile?.displayName, user?.displayName]
);

const photoURL = useMemo(() => 
  profile?.photoURL || user?.photoURL,
  [profile?.photoURL, user?.photoURL]
);
```

**Benefits:**
- Prevents unnecessary re-renders
- Faster navigation response
- Better scroll performance

---

### Solution 4: Add Loading Feedback

**File:** `src/components/navbar.tsx`

```typescript
const [isNavigating, setIsNavigating] = useState(false);

const handleNavClick = async (href: string) => {
  setIsNavigating(true);
  try {
    await router.push(href);
  } finally {
    setTimeout(() => setIsNavigating(false), 300);
  }
};
```

**Add visual feedback:**
```typescript
{isNavigating && (
  <div className="fixed top-0 left-0 h-1 bg-primary animate-progress w-full z-50" />
)}
```

**Benefits:**
- Users know click was registered
- Better perceived performance
- Reduced frustration

---

### Solution 5: Optimize Router Calls

**File:** `src/components/BuildCard.tsx`

**Current:**
```typescript
const handleCardClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  router.push(buildLink);
};
```

**Optimized:**
```typescript
const handleCardClick = useCallback((e: React.MouseEvent) => {
  e.stopPropagation();
  startTransition(() => {
    router.push(buildLink);
  });
}, [buildLink, router]);
```

---

### Solution 6: Add Prefetching

**File:** `src/components/navbar.tsx`

```typescript
// Prefetch tools page on hover
const [hoveredItem, setHoveredItem] = useState<string | null>(null);

const handleMouseEnter = (href: string) => {
  setHoveredItem(href);
  // Prefetch the page
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};
```

**Benefits:**
- Page loads before click
- Instant navigation
- Better UX

---

### Solution 7: Reduce Layout Re-renders

**File:** `src/components/MainLayout.tsx`

```typescript
const MainLayoutContent = React.memo(({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    if (profile?.preferences?.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [profile?.preferences?.reducedMotion]);

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <ServerStatusBanner />
      <VerificationBanner />
      <Navbar />
      <CommandMenu />
      <main className={`flex-1 w-full ${isHomePage ? '' : ''}`}>
        {children}
      </main>
      <Footer />
      <CookieBanner />
    </div>
  );
});
```

---

### Solution 8: Optimize Firestore Listeners

**File:** `src/context/AuthContext.tsx`

**Add debouncing to profile updates:**
```typescript
import { debounce } from '@/lib/utils';

const updateProfileDebounced = debounce(async (uid: string, data: any) => {
  await updateUserProfile(uid, data);
}, 500);
```

**Benefits:**
- Fewer Firestore writes
- Faster navigation
- Reduced latency

---

## Implementation Priority

### High Priority (Do First)
1. ✅ Add `useTransition` to navigation
2. ✅ Optimize Auth Context (non-blocking profile load)
3. ✅ Memoize Navbar component

### Medium Priority
4. Add loading feedback
5. Optimize router calls in BuildCard
6. Add prefetching on hover

### Low Priority
7. Reduce layout re-renders
8. Optimize Firestore listeners

---

## Testing

### Before Fix
1. Click navigation link
2. Measure time until page starts loading
3. Note any lag or delay

### After Fix
1. Click navigation link
2. Should see immediate feedback
3. Page transition should be smooth
4. No blocking or freezing

### Metrics to Track
- **Navigation Response Time:** Should be < 100ms
- **Time to Interactive:** Should be < 2s
- **First Contentful Paint:** Should be < 1.5s

---

## Code Changes Required

### Files to Modify
1. `src/components/navbar.tsx` - Add useTransition, memo
2. `src/context/AuthContext.tsx` - Non-blocking profile load
3. `src/components/BuildCard.tsx` - Optimize router calls
4. `src/components/MainLayout.tsx` - Memoize layout
5. `src/app/builds/BuildsClient.tsx` - Already optimized ✅

### Estimated Time
- **Implementation:** 1-2 hours
- **Testing:** 30 minutes
- **Total:** 2 hours max

---

## Expected Results

### Performance Improvements
- **Navigation Response:** 60-80% faster
- **Page Transitions:** Smooth, no blocking
- **Perceived Performance:** Much better with loading feedback
- **Scroll Performance:** Improved with memoization

### User Experience
- Clicks feel instant
- No "is it working?" moments
- Smooth transitions between pages
- Better overall polish

---

## Rollback Plan

If issues occur:
1. Remove `useTransition` wrappers
2. Revert Auth Context changes
3. Remove memoization

All changes are non-breaking and can be reverted individually.

---

**Status:** Ready to Implement  
**Priority:** High  
**Impact:** Significant UX improvement
