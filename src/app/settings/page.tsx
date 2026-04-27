'use client';

import Link from 'next/link';
import { ShieldOff, ArrowRight, Store, Sword, Coins } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const t = useTranslations('Settings');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 md:p-10">
        <div className="flex items-center gap-3 text-primary">
          <ShieldOff className="h-8 w-8" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">Guest Mode</span>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Authentication and authorization have been removed from this local build. Account-specific settings,
          notifications, and profile management are disabled so the rest of the toolkit can run without Firebase credentials.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/tools/market-flipper" className="rounded-2xl border border-border bg-muted/30 p-5 transition-colors hover:bg-muted/50">
            <Store className="h-6 w-6 text-primary" />
            <h2 className="mt-4 font-semibold text-foreground">Market Flipper</h2>
            <p className="mt-2 text-sm text-muted-foreground">Browse arbitrage opportunities without signing in.</p>
          </Link>

          <Link href="/tools/pvp-intel" className="rounded-2xl border border-border bg-muted/30 p-5 transition-colors hover:bg-muted/50">
            <Sword className="h-6 w-6 text-primary" />
            <h2 className="mt-4 font-semibold text-foreground">PvP Intel</h2>
            <p className="mt-2 text-sm text-muted-foreground">Search players and inspect combat data in guest mode.</p>
          </Link>

          <Link href="/profits/crafting" className="rounded-2xl border border-border bg-muted/30 p-5 transition-colors hover:bg-muted/50">
            <Coins className="h-6 w-6 text-primary" />
            <h2 className="mt-4 font-semibold text-foreground">Profit Tools</h2>
            <p className="mt-2 text-sm text-muted-foreground">Use the calculators without account setup.</p>
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back To Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
