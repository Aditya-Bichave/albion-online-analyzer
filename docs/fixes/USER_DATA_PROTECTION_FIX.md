# Critical User Data Protection Fix

**Date:** March 24, 2026  
**Issue:** User rank not updating correctly + Join date being overwritten on login  
**Severity:** CRITICAL ⚠️

---

## Problems Identified

### 1. Rank Not Updating (2211 builds but shows "Adept") ❌

**Root Cause:**
The `calculateUserGamification` function was using `builds.length` to calculate rank, but the profile page only loads **12 builds at a time** (paginated). So even though a user has 2211 builds, the calculation was only seeing 12 builds.

**Before:**
```typescript
// UserProfileClient.tsx line 215
const { rank, badges } = profile ? calculateUserGamification(profile, builds) : ...

// user-profile.ts
export function calculateUserGamification(profile: UserProfile, builds: any[]) {
  const buildCount = builds.length; // ❌ Only counts loaded builds (12)
  // ...
}
```

**Fix:**
Pass the **total build count** separately from the paginated builds array:

```typescript
// UserProfileClient.tsx line 215
const { rank, badges } = profile ? calculateUserGamification(profile, builds, totalBuilds) : ...

// user-profile.ts
export function calculateUserGamification(profile: UserProfile, builds: any[], totalBuildsOverride?: number) {
  // Use override if provided (for accurate count when builds array is paginated)
  const buildCount = totalBuildsOverride !== undefined ? totalBuildsOverride : builds.length;
  // ...
}
```

---

### 2. Join Date Being Overwritten ("Recently" instead of actual date) ❌

**Root Cause:**
The `ensureProfileExists` function in `AuthContext.tsx` was updating user profiles on every login without protecting critical fields like `createdAt`.

**Issues:**
1. No explicit protection for `createdAt` field
2. `lastLoginAt` wasn't being tracked
3. Protected fields could be overwritten by merge operation

**Fix:**
Implemented a **protected fields system** that explicitly prevents overwriting critical user data:

```typescript
// AuthContext.tsx - ensureProfileExists function
const protectedFields = [
  'createdAt',           // Join date - NEVER overwrite
  'characterName',       // Albion character linkage
  'characterId',
  'guildName',           // Guild affiliation
  'guildId',
  'allianceName',
  'allianceId'
];

// Filter updates to exclude protected fields
const safeUpdates: any = {};
for (const [key, value] of Object.entries(updates)) {
  if (!protectedFields.includes(key)) {
    safeUpdates[key] = value;
  }
}

await setDoc(docRef, safeUpdates, { merge: true });
```

**Additional Improvements:**
- Added `lastLoginAt` field to track actual login times
- Only update missing fields, never overwrite existing user data
- Clear comments documenting what can/cannot be modified

---

### 3. Rank Calculation Not Using Total Views Either ⚠️

**Related Issue:**
The rank calculation also uses `totalViews` from builds, but since we only load 12 builds, the view count is also wrong.

**Current Behavior:**
```typescript
const totalViews = builds.reduce((acc, build) => acc + (build.views || 0), 0);
// With 12 builds: Only counts views from those 12 builds
```

**Note:** This is **partially acceptable** because:
- Views are less important for rank than build count
- Loading all builds just for view count would be expensive
- The XP formula weights builds (50 XP) much higher than views (1 XP)

**Future Enhancement:**
Store `totalViews` in the user profile document and update it when builds are created/updated/deleted.

---

## Files Changed

### 1. `src/lib/user-profile.ts`
**Changes:**
- Updated `calculateUserGamification` signature to accept optional `totalBuildsOverride` parameter
- Added logic to use override count when provided

**Lines:** 78-89

---

### 2. `src/app/user/[userId]/UserProfileClient.tsx`
**Changes:**
- Pass `totalBuilds` to `calculateUserGamification` call
- Rank now calculates based on actual total build count (2211), not paginated count (12)

**Lines:** 215

---

### 3. `src/context/AuthContext.tsx`
**Changes:**
- Added protected fields system
- Added `lastLoginAt` tracking
- Enhanced comments explaining what can/cannot be modified
- Explicit filtering of protected fields before database write

**Lines:** 117-177

---

### 4. `src/lib/notification-service.ts`
**Changes:**
- Updated `checkAndNotifyRankUp` to accept optional `totalBuildsCount` parameter
- Passes count through to `calculateUserGamification`

**Lines:** 237-247

---

### 5. `src/lib/builds-service.ts`
**Changes:**
- Updated `createBuild` to get total build count before checking rank up
- Ensures rank-up notifications use accurate build count

**Lines:** 371-375

---

## Testing Checklist

### Rank Calculation
- [ ] User with 2211 builds shows correct rank (should be Grandmaster with 110,550+ XP)
- [ ] User with 0 builds shows "Wanderer"
- [ ] User with 1 build shows "Novice" or "Journeyman" (depending on views)
- [ ] Rank updates immediately after publishing a build
- [ ] Badge calculations use correct counts

### Join Date Protection
- [ ] Existing users retain their original `createdAt` date
- [ ] Login does NOT change `createdAt`
- [ ] `lastLoginAt` updates on each login
- [ ] Profile page shows correct join date (not "Recently")
- [ ] Character name linkage is preserved
- [ ] Guild affiliation is preserved

### Data Integrity
- [ ] Username changes persist across logins
- [ ] Custom avatar persists across logins
- [ ] Email notifications preferences persist
- [ ] All user preferences persist

---

## XP Calculation Reference

**Formula:** `XP = (Builds × 50) + (Total Views × 1)`

| Rank | XP Required | Example |
|------|-------------|---------|
| Wanderer | 0 | 0 builds |
| Novice | 1+ builds OR 50+ XP | 1 build = 50 XP |
| Journeyman | 50+ XP | 1 build + 0 views |
| Adept | 200+ XP | 4 builds |
| Expert | 1,000+ XP | 20 builds |
| Master | 5,000+ XP | 100 builds |
| Grandmaster | 25,000+ XP | 500 builds |

**Example Calculation for 2211 builds:**
```
Builds: 2211
Views: 0 (in this example)

XP = (2211 × 50) + (0 × 1)
XP = 110,550 + 0
XP = 110,550

Rank: Grandmaster (requires 25,000 XP)
```

---

## Migration Needs

### Database Migration (Optional)
For users with incorrect `createdAt` dates:

```javascript
// Firestore query to find affected users
// (those with createdAt within last 24 hours but have old builds)
// Manual review needed - DO NOT run automated migration
```

**Recommendation:** Do NOT run automated migration. Fix the code to prevent future issues, and let users naturally re-login to get `lastLoginAt` tracked properly.

---

## Monitoring

### Add to Analytics
Track these metrics to ensure fix is working:

1. **Rank Distribution** - Should show more Grandmasters/Masters now
2. **Profile Load Time** - Should not increase significantly
3. **User Complaints** - Monitor Discord for "my rank is wrong" reports

### Debug Queries
```javascript
// Find users with rank mismatches
// (high build count but low rank)
// Run in Firestore console or admin panel
```

---

## Rollback Plan

If issues occur:

1. **Revert `user-profile.ts`** - Remove `totalBuildsOverride` parameter
2. **Revert `AuthContext.tsx`** - Remove protected fields logic
3. **Revert `UserProfileClient.tsx`** - Remove `totalBuilds` argument

**Risk:** Low - changes are additive and backward compatible

---

## Future Enhancements

### 1. Store Rank in User Profile
Instead of calculating in real-time, store `currentRank` and `xp` in the user document:

```typescript
interface UserProfile {
  // ... existing fields
  currentRank: UserRank;
  totalXP: number;
  lastRankCalculation: Timestamp;
}
```

**Pros:**
- Faster profile loads
- Consistent rank display everywhere
- Easier to debug issues

**Cons:**
- Need to update on every build change
- Potential for stale data

---

### 2. Background Rank Recalculation
Run a daily Cloud Function to recalculate all user ranks:

```typescript
// Scheduled Cloud Function (daily)
export async function recalculateAllRanks() {
  const users = await getAllUsers();
  for (const user of users) {
    const builds = await getUserBuilds(user.uid);
    const { rank, xp } = calculateUserGamification(user, builds);
    await updateUserProfile(user.uid, { currentRank: rank, totalXP: xp });
  }
}
```

---

### 3. Real-time Rank Updates
Use Firestore triggers to update rank when builds change:

```typescript
// Firestore trigger on builds collection
export const onBuildCreated = functions.firestore
  .document('builds/{buildId}')
  .onCreate(async (build, context) => {
    const authorId = build.data().authorId;
    await recalculateUserRank(authorId);
  });
```

---

## Success Criteria

✅ **Fixed when:**
1. User with 2211 builds shows "Grandmaster" rank
2. Join date shows actual join date (not "Recently")
3. Username/avatar/character data persists across logins
4. No user complaints about data loss
5. Rank updates within 5 seconds of publishing a build

---

## Related Issues

- Issue #1: Profile picture disappearing (fixed in previous commit)
- Issue #2: Username resetting (fixed in previous commit)
- Issue #3: Pagination disappearing (fixed in previous commit)

---

**Status:** ✅ Fixed  
**Testing Required:** Manual testing with affected users  
**Deploy:** Immediate - this is a critical data integrity fix
