'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  lastSegmentLabel?: string;
}

export function Breadcrumbs({ lastSegmentLabel }: BreadcrumbsProps) {
  const pathname = usePathname();
  const t = useTranslations('NotFound.breadcrumbs');

  // Convert path to breadcrumbs
  const pathSegments = pathname.split('/').filter(segment => segment !== '');

  const breadcrumbs: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    let href = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSegments.length - 1;

    // Redirect map for segments that don't have index pages
    const REDIRECT_MAP: Record<string, string> = {
      '/community/edit': '/community',
      '/community/thread': '/community',
    };

    if (REDIRECT_MAP[href]) {
      href = REDIRECT_MAP[href];
    }

    // Format label (capitalize and replace hyphens)
    let label = segment;

    if (isLast && lastSegmentLabel) {
      label = lastSegmentLabel;
    } else if (
      // Long segments are always "Detail"
      segment.length > 20 ||
      // Segments with dashes (like build-slugs) longer than 15 chars
      (segment.includes('-') && segment.length > 15) ||
      // Pure alphanumeric 16+ chars (UUIDs, build IDs)
      /^[A-Za-z0-9]{16,}$/.test(segment)
    ) {
      label = 'Detail';
    } else {
      // Try to get translated label first, fallback to formatted segment
      const translatedLabel = t(segment as any);
      if (translatedLabel && translatedLabel !== segment) {
        label = translatedLabel;
      } else {
        label = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    return { label, href };
  });

  if (breadcrumbs.length === 0) return null;

  // Always use production URL for Schema.org
  const baseUrl = 'https://albionkit.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('home'), item: baseUrl },
      ...breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem' as const,
        position: index + 2,
        name: crumb.label,
        item: `${baseUrl}${crumb.href}`
      }))
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-2 overflow-hidden whitespace-nowrap">
        {/* Home */}
        <Link
          href="/"
          className="hover:text-primary transition-colors flex items-center gap-1 shrink-0"
        >
          <Home className="h-3 w-3" />
          {t('home')}
        </Link>

        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isSecondToLast = index === breadcrumbs.length - 2;
          const length = breadcrumbs.length;

          // 1. Handle Middle Items (Hide if path is deep)
          // We want to keep Home, Parent, and Current visible.
          const isMiddle = !isLast && index > 0 && !isSecondToLast;
          const shouldHideMiddle = length > 3 && isMiddle;

          if (shouldHideMiddle) {
            // Show "..." only once for the first hidden item
            if (index === 1) {
              return (
                <React.Fragment key="ellipsis">
                  <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
                  <span className="text-muted-foreground/40 shrink-0">...</span>
                </React.Fragment>
              );
            }
            return null;
          }

          // 2. Render Parent or Current
          return (
            <React.Fragment key={`${index}-${crumb.href}`}>
              <ChevronRight className="h-3 w-3 opacity-40 shrink-0" />
              {isLast ? (
                // Current Page: Truncate with ellipsis if too long on mobile
                <span className="text-primary/80 font-black truncate max-w-[6rem] sm:max-w-none" title={crumb.label}>
                  {crumb.label}
                </span>
              ) : (
                // Parent Page: Truncate with ellipsis if too long on mobile
                <Link
                  href={crumb.href}
                  className="hover:text-primary transition-colors truncate max-w-[4rem] sm:max-w-none"
                  title={crumb.label}
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
}
