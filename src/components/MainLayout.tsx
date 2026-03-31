'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ServerStatusBanner } from './ServerStatusBanner';
import { Footer } from './footer';
import { CookieBanner } from './CookieBanner';
import { CommandMenu } from './CommandMenu';
import { useAuth } from '@/context/AuthContext';
import { VerificationBanner } from './VerificationBanner';
import { CommandMenuProvider, useCommandMenu } from '@/context/CommandMenuContext';
import { NavigationProgress } from './NavigationProgress';
import { SidebarLayout } from './SidebarLayout';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const { isOpen, setIsOpen } = useCommandMenu();
  const pathname = usePathname();

  // Apply reduced motion preference
  useEffect(() => {
    if (profile?.preferences?.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [profile?.preferences?.reducedMotion]);

  return (
    <SidebarLayout>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <NavigationProgress />
        <ServerStatusBanner />
        <VerificationBanner />
        <CommandMenu />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="min-h-full">
            {children}
          </div>
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </SidebarLayout>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandMenuProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </CommandMenuProvider>
  );
}
