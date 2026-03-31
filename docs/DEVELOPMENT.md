# Development Setup Guide

This guide will help you set up your development environment for AlbionKit.

## 📋 Prerequisites

### Required Software

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### Recommended Tools

- **VS Code** ([Download](https://code.visualstudio.com/))
- **VS Code Extensions:**
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Hero
  - ES7+ React/Redux/React-Native snippets

### Accounts Needed

- **Firebase** (for authentication)
- **Albion Online** (game account for testing)
- **Lemon Squeezy** (optional, for payments)
- **Resend** (optional, for emails)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/albionkit.git
cd albionkit
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your credentials

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Other Services

See `.env.example` for all required keys.

## 📝 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Check translations
npm run i18n:check

# Type check
npx tsc --noEmit
```

## 🗂️ Project Structure

```
albionkit/
├── src/
│   ├── app/                 # Pages (Next.js App Router)
│   ├── components/          # React components
│   ├── lib/                 # Utilities & services
│   ├── hooks/               # Custom hooks
│   ├── context/             # React Context
│   ├── i18n/                # i18n config
│   └── data/                # Static data
├── messages/                # Translations
├── public/                  # Static assets
├── docs/                    # Documentation
└── scripts/                 # Utility scripts
```

## 💻 Working with the Codebase

### Adding a New Page

1. Create file in `src/app/your-page/page.tsx`
2. Export default component
3. Test at `http://localhost:3000/your-page`

```tsx
// src/app/your-page/page.tsx
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  );
}
```

### Adding a New Component

1. Create file in `src/components/your-component.tsx`
2. Use TypeScript
3. Export the component

```tsx
// src/components/your-component.tsx
interface YourComponentProps {
  title: string;
}

export function YourComponent({ title }: YourComponentProps) {
  return <div>{title}</div>;
}
```

### Adding Translations

1. Add key to `messages/en.json`
2. Translate to other languages
3. Use in component:

```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('YourSection');
return <p>{t('yourKey')}</p>;
```

### Adding API Route

1. Create file in `src/app/api/your-route/route.ts`
2. Export HTTP method handlers

```tsx
// src/app/api/your-route/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ data: 'test' });
}
```

## 🧪 Testing

### Manual Testing Checklist

Before committing:

- [ ] Code compiles: `npm run build`
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Tested on desktop
- [ ] Tested on mobile viewport
- [ ] Checked dark/light mode

### Testing Features

1. **Authentication:**
   - Sign up flow
   - Login flow
   - Logout
   - Protected routes

2. **Market Tools:**
   - Data loads correctly
   - Filters work
   - Charts display

3. **Calculators:**
   - Input validation
   - Calculations accurate
   - Results display

4. **Responsive:**
   - Mobile (< 640px)
   - Tablet (640-1024px)
   - Desktop (> 1024px)

## 🐛 Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Common Issues

**Build fails:**
```bash
# Clear cache
rm -rf .next
npm run build
```

**Dependencies issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Check types
npx tsc --noEmit
```

## 📦 State Management

### When to Use What

- **Local State:** `useState` - Component-specific data
- **URL State:** Search params - Filters, pagination
- **Context:** `AuthContext` - Global app state
- **Server State:** React Query patterns - API data

### Example: Form with Local State

```tsx
'use client';

import { useState } from 'react';

export function MyForm() {
  const [value, setValue] = useState('');
  
  return (
    <input 
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

### Example: URL State for Filters

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function FilterComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const filter = searchParams.get('filter') || 'all';
  
  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', value);
    router.push(`?${params.toString()}`);
  };
  
  // ...
}
```

## 🎨 Styling Guidelines

### Tailwind CSS

Use utility classes:

```tsx
<div className="flex items-center gap-2 p-4 bg-card rounded-lg border border-border">
  {/* Content */}
</div>
```

### Component Patterns

```tsx
interface Props {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: Props) {
  return (
    <div className={`bg-card rounded-lg border border-border p-4 ${className || ''}`}>
      {children}
    </div>
  );
}
```

## 🌙 Theme Support

### Using Themes

```tsx
'use client';

import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  );
}
```

## 📚 Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Internal Docs

- [Architecture](ARCHITECTURE.md)
- [Translation Guide](TRANSLATION_GUIDE.md)
- [Contributing Guide](../CONTRIBUTING.md)

## 🆘 Getting Help

- Check existing issues
- Read documentation
- Ask in Discord
- Open a new issue

## 💖 Support the Project

Find AlbionKit useful? Support its development:

- [Buy Me a Coffee](https://www.buymeacoffee.com/cosmic_fi)
- [GitHub Sponsors](https://github.com/sponsors/cosmic-fi)

## ✅ Next Steps

After setup:

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Find a [good first issue](https://github.com/yourusername/albionkit/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
3. Start contributing!

Happy coding! 🚀