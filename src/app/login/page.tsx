'use client';

import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Login');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">{t('loginTitle')}</h1>
        <p className="mt-3 text-muted-foreground">
          Authentication has been removed from this local build, so everything now runs in guest mode.
        </p>
      </div>
    </div>
  );
}
