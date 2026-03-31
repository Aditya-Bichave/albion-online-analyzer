# Architecture Overview

This document provides a high-level overview of the AlbionKit architecture.

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                         Client (Browser)                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js 16 (App Router)                │   │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐   │   │
│  │  │   Pages    │  │ Components │  │   Hooks      │   │   │
│  │  │   (SSR/    │  │   (Client) │  │  (Client)    │   │   │
│  │  │   SSG)     │  │            │  │              │   │   │
│  │  └────────────┘  └────────────┘  └──────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
┌────────────────────────────────────────────────────────────┐
│                      External Services                     │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Firebase  │  │   Albion   │  │  Payment Gateway     │  │
│  │  (Auth/    │  │   Data     │  │  (Lemon Squeezy)     │  │
│  │  Firestore)│  │   API      │  │                      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Resend    │  │   ImgBB    │  │  reCAPTCHA           │  │
│  │  (Email)   │  │  (Images)  │  │  (Security)          │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

## 📁 Directory Structure

```
albionkit/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/             # Route groups
│   │   ├── api/                  # API endpoints
│   │   ├── tools/                # Tool pages
│   │   ├── profits/              # Profit calculators
│   │   ├── builds/               # Build database
│   │   └── layout.tsx            # Root layout
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   └── [feature]/            # Feature-specific components
│   │
│   ├── lib/                      # Utilities & Services
│   │   ├── albion-api-client.ts  # Albion API wrapper
│   │   ├── market-service.ts     # Market data
│   │   ├── firebase.ts           # Firebase config
│   │   └── ...
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useServer.ts
│   │   └── ...
│   │
│   ├── context/                  # React Context
│   │   ├── AuthContext.tsx
│   │   └── ...
│   │
│   ├── i18n/                     # Internationalization
│   │   └── request.ts
│   │
│   └── data/                     # Static data
│       ├── builds.json
│       └── ...
│
├── messages/                     # Translation files
│   ├── en.json
│   ├── de.json
│   └── ...
│
├── public/                       # Static assets
│   ├── screenshots/
│   └── background/
│
└── docs/                         # Documentation
```

## 🔑 Core Components

### 1. Next.js App Router

**Location:** `src/app/`

Uses Next.js 16 App Router with:
- Server Components (default)
- Client Components (`'use client'`)
- Server Actions for mutations
- Route handlers for API endpoints

**Key Features:**
- Automatic code splitting
- Server-side rendering (SSR)
- Static site generation (SSG)
- Streaming and Suspense

### 2. Component Architecture

**UI Components** (`src/components/ui/`):
- Reusable, presentational components
- No business logic
- Fully typed with TypeScript
- Support theming

**Feature Components** (`src/components/[feature]/`):
- Feature-specific components
- Contain business logic
- Use custom hooks
- Connect to services

### 3. Service Layer

**Location:** `src/lib/`

Services encapsulate business logic:

```typescript
// Example service pattern
export async function getMarketData(
  items: string[],
  region: Region
): Promise<MarketData[]> {
  // 1. Check cache
  // 2. Fetch from API if needed
  // 3. Transform data
  // 4. Return formatted result
}
```

**Services:**
- `albion-api-client.ts` - Albion API wrapper
- `market-service.ts` - Market data
- `builds-service.ts` - Build management
- `firebase.ts` - Firebase integration
- `notification-service.ts` - User notifications

### 4. State Management

**Approach:** Minimal global state

- **Server State:** React Query / SWR patterns
- **Client State:** React Context + Hooks
- **Form State:** Local component state
- **URL State:** Search params for filters

**Context Providers:**
- `AuthContext` - User authentication
- `CommandMenuContext` - Global command menu
- `LoginModalContext` - Login modal state

### 5. Data Flow

```
User Action
    │
    ↓
Component (Client)
    │
    ↓
Server Action / API Route
    │
    ↓
Service Layer
    │
    ↓
External API / Database
    │
    ↓
Transform & Return
    │
    ↓
Update UI
```

## 🔐 Authentication Flow

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  User   │───▶│  Firebase│────▶│  Auth    │────▶│  App     │
│         │     │  Auth    │     │  Context │     │  State   │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                  │                │
     │  1. Login      │                  │                │
     │───────────────▶│                  │                │
     │                │  2. Token        │                │
     │                │─────────────────▶│                │
     │                │                  │  3. User Data  │
     │                │                  │───────────────▶│
     │                │                  │                │
     │                │                  │  4. Auth State │
     │◀───────────────────────────────────────────────────│
```

## 🌐 API Integration

### Albion Data API

**Service:** `src/lib/albion-api-client.ts`

```typescript
// Example usage
const items = await fetchItems(['T4_MAIN_SWORD', 'T5_ARMOR_PLATE']);
const prices = await fetchMarketPrices(items, 'west');
```

**Features:**
- Client-side caching (localStorage)
- Request deduplication
- Error handling
- Fallback to server actions

### Firebase Integration

**Services:**
- Authentication (OAuth + Email)
- Firestore (User data, builds)
- Storage (User uploads)

**Pattern:**
```typescript
// Client-side Firebase
import { auth, db } from '@/lib/firebase';

// Server-side Firebase Admin
import admin from 'firebase-admin';
```

## 🎨 Styling System

### Tailwind CSS 4

**Configuration:**
- Utility-first CSS
- Custom design tokens
- Dark mode support
- Responsive breakpoints

**Component Pattern:**
```tsx
<div className="
  flex items-center gap-2
  bg-card border border-border
  rounded-xl p-4
  hover:bg-accent transition-colors
">
  {/* Content */}
</div>
```

### Theme System

**Provider:** `src/components/theme-provider.tsx`

- Light/Dark mode
- System preference detection
- Persistent user preference
- CSS custom properties

## 🌍 Internationalization

### next-intl

**Configuration:** `src/i18n/request.ts`

**Pattern:**
```typescript
import { getTranslations } from 'next-intl/server';

const t = await getTranslations('HomePage');
return <h1>{t('title')}</h1>;
```

**Translation Files:** `messages/[lang].json`

**Supported Languages:** 10+

## 📊 Data Management

### Build Data

**Location:** `src/data/builds.json`

- Static build database
- Community submissions
- Merged with stats from `build-stats.json`
- Read-only in current version

### Market Data

**Source:** Albion API

- Real-time price fetching
- Client-side caching
- Volume tracking
- Historical data

### User Data

**Storage:** Firebase Firestore

- User profiles
- Preferences
- Watchlists
- Build submissions

## 🚀 Performance Optimizations

### Code Splitting

- Automatic by Next.js
- Route-based splitting
- Dynamic imports for heavy components

### Caching Strategy

```
┌─────────────────┐
│  Browser Cache  │  (localStorage)
└────────┬────────┘
         │
┌────────▼────────┐
│  React Cache    │  (In-memory)
└────────┬────────┘
         │
┌────────▼────────┐
│  Server Cache   │  (Redis/Firestore)
└────────┬────────┘
         │
┌────────▼────────┐
│  External API   │  (Albion API)
└─────────────────┘
```

### Image Optimization

- Next.js Image component
- WebP format
- Lazy loading
- Responsive sizes

## 🔒 Security Measures

### Input Validation

- Server-side validation
- Client-side validation
- Sanitization
- Type safety (TypeScript)

### Authentication

- Firebase Auth
- JWT tokens
- Session management
- Protected routes

### API Security

- Rate limiting
- CORS configuration
- API key protection
- Environment variables

## 📈 Monitoring

### Error Tracking

- Console logging (development)
- Error boundaries
- Try-catch in async operations

### Performance Monitoring

- Next.js telemetry
- Lighthouse scores
- Web Vitals

## 🔄 Development Workflow

```
1. Local Development
   ↓
2. Git Commit
   ↓
3. Push to GitHub
   ↓
4. Vercel Build
   ↓
5. Automated Tests
   ↓
6. Preview Deployment
   ↓
7. Production Deploy
```

## 📦 Dependencies

### Core

- `next` - Framework
- `react` - UI library
- `typescript` - Type safety

### UI

- `tailwindcss` - Styling
- `lucide-react` - Icons
- `recharts` - Charts

### Backend

- `firebase` - Auth/Database
- `firebase-admin` - Server Firebase
- `next-intl` - i18n

### Dev

- `eslint` - Linting
- `@types/*` - Type definitions

---

**Last Updated:** March 2026
