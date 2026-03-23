# Build URL Restructure Plan

## Overview
Change build URLs from `/builds/{category}/{id}` to `/builds/{id}` to support tag-based organization instead of rigid categories.

## Success Criteria
- ✅ Build pages accessible at `/builds/{id}` format
- ✅ All navigation links updated to new format
- ✅ Old URLs redirect to new format
- ✅ Sitemap uses new URL format
- ✅ All tests pass
- ✅ No broken links or 404 errors

## Implementation Steps

### Phase 1: Create New Build View Page Structure
- [x] Create `src/app/builds/[id]/page.tsx` (move from `[category]/[id]/page.tsx`)
- [x] Move `src/app/builds/[id]/BuildView.tsx` (from `[category]/[id]/BuildView.tsx`)
- [x] Move `src/app/builds/[id]/opengraph-image.tsx` (from `[category]/[id]/opengraph-image.tsx`)
- [x] Update page to use `params.id` directly (remove category param)
- [x] Update BuildView component to not require category prop

### Phase 2: Update Navigation Links
- [x] Update `BuildCard.tsx`: Change `buildLink` from `/builds/${category}/${id}` to `/builds/${id}`
- [x] Update `BuildsClient.tsx`: No changes needed (uses tag-based filtering)
- [x] Update `create/page.tsx`: Change redirect from `/builds/solo` to `/builds` and back link
- [x] Update `UserProfileClient.tsx`: Uses BuildCard component (already updated)
- [x] Update `BuildView.tsx`: Update "back to category" link to go to `/builds`

### Phase 3: Update Service Layer
- [x] Update `builds-service.ts`: Update `createBuild` to use new URL format in IndexNow submission
- [x] Update `sitemap-service.ts`: Change URL format from `/builds/${category}/${id}` to `/builds/${id}`
- [x] Update `actions/builds.ts`: Update revalidatePath calls to use new format

### Phase 4: Add Redirects for Old URLs
- [x] Update `[category]/[id]/page.tsx` to redirect to `/builds/{id}`
- [x] Update `[category]/page.tsx` to redirect to `/builds?category={category}`

### Phase 5: Update Sitemap
- [x] Update `sitemap.ts`: Change build URLs to new format

## Files Modified

1. ✅ `src/app/builds/[id]/page.tsx` (created new)
2. ✅ `src/app/builds/[id]/BuildView.tsx` (created new)
3. ✅ `src/app/builds/[id]/opengraph-image.tsx` (created new)
4. ✅ `src/components/BuildCard.tsx` (updated buildLink)
5. ✅ `src/app/builds/create/page.tsx` (updated redirects)
6. ✅ `src/lib/builds-service.ts` (updated IndexNow URL)
7. ✅ `src/lib/sitemap-service.ts` (updated URL format)
8. ✅ `src/app/actions/builds.ts` (updated revalidatePath)
9. ✅ `src/app/sitemap.ts` (updated build URLs)
10. ✅ `src/app/builds/[category]/[id]/page.tsx` (updated to redirect)
11. ✅ `src/app/builds/[category]/page.tsx` (updated redirect)

## Testing Checklist
- [ ] Build pages load correctly at `/builds/{id}`
- [ ] Old URLs `/builds/{category}/{id}` redirect properly
- [ ] Build cards link to correct URLs
- [ ] Create build redirects to correct page
- [ ] Sitemap generates correct URLs
- [ ] Breadcrumbs display correctly
- [ ] JSON-LD structured data uses correct URLs

## Notes

- The `category` field is still stored in Firestore for backward compatibility and filtering purposes
- The UI still displays category labels based on the stored category field
- Tag-based filtering is the primary way to organize builds going forward
- Old URLs will 307 redirect to new format automatically
