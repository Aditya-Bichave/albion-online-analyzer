# AlbionKit Feature Roadmap 2026

**Created:** March 24, 2026  
**Based on:** Comprehensive competitor analysis of 15+ Albion Online companion tools  
**Goal:** Achieve feature parity with market leaders while differentiating through UX and mobile presence

---

## Roadmap Summary

| Quarter | Focus | Key Features | Estimated Effort |
|---------|-------|--------------|------------------|
| **Q1 2026** | Core Features | Laborer Calculator, Enchant Calculator, Discord Bot (MVP) | 8-10 weeks |
| **Q2 2026** | PvP Analytics | Killboard (MVP), Player Stats, Weapon Analytics | 10-12 weeks |
| **Q3 2026** | Guild Features | Guild Dashboard, Event Scheduling, Attendance Tracking | 8-10 weeks |
| **Q4 2026** | Mobile Launch | iOS/Android App, Push Notifications | 12-16 weeks |
| **2027** | Advanced Features | Private Flips, Regear Calculator, Multi-Language | Ongoing |

---

## Phase 1: Core Features (Q1 2026)

### 1.1 Laborer Calculator 🔴 HIGH PRIORITY
**Competitors:** AlbionOnlineGrind, Albion Free Market  
**Effort:** 2-3 weeks  
**Impact:** High  
**Priority:** ⭐⭐⭐⭐⭐

#### Features
- [ ] Laborer type selection (Scholar, Farmer, Lumberjack, etc.)
- [ ] Journal return calculations
- [ ] Focus point optimization
- [ ] Multi-city comparison (all 7 royal cities + Black Market)
- [ ] Laborer cost vs profit analysis
- [ ] Optimal laborer assignment recommendations
- [ ] Daily/weekly profit projections
- [ ] Laborer upgrade cost calculator

#### Technical Requirements
- Market data API integration for journal prices
- Focus point calculations
- Laborer type database
- City-specific tax rates

#### Success Metrics
- 50% of users engage with calculator
- Average session time > 3 minutes
- User retention +15%

---

### 1.2 Enchantment Calculator 🔴 HIGH PRIORITY
**Competitors:** AlbionOnlineGrind, AlbionCalculator  
**Effort:** 2-3 weeks  
**Impact:** Medium-High  
**Priority:** ⭐⭐⭐⭐

#### Features
- [ ] Enchantment cost calculator (4.0, 4.1, 4.2, 4.3)
- [ ] Material breakdown (runes, relics, souls)
- [ ] Success rate calculations
- [ ] Enchant vs buy analysis
- [ ] Optimal enchantment path recommendations
- [ ] Total gear power calculator
- [ ] Enchantment profit/loss calculator
- [ ] Batch enchantment cost estimator

#### Technical Requirements
- Enchantment success rate formulas
- Rune/relic/soul market prices
- Item power calculation formulas
- Gear database integration

#### Success Metrics
- 30% of build creators use calculator
- Average 5 calculations per session
- Positive user feedback (>4/5 rating)

---

### 1.3 Discord Bot (MVP) 🟡 MEDIUM PRIORITY
**Competitors:** AlbionOnlineTools, AlbionBattleHub, KillBoard #1  
**Effort:** 3-4 weeks  
**Impact:** High  
**Priority:** ⭐⭐⭐⭐⭐

#### Features (MVP)
- [ ] Kill/death notifications for tracked players
- [ ] Market price alerts (threshold-based)
- [ ] Daily reset timer reminders
- [ ] Basic commands: `!price`, `!build`, `!stats`
- [ ] Server selection (Americas, Europe, Asia)
- [ ] Guild recruitment channel integration

#### Technical Requirements
- Discord.js or similar framework
- WebSocket connection for real-time updates
- Database for user preferences
- Rate limiting for API calls

#### Success Metrics
- 1,000+ Discord server installations in first month
- 10,000+ notifications sent daily
- 50+ active servers

---

### 1.4 Additional Calculators 🟡 MEDIUM PRIORITY
**Effort:** 3-4 weeks total  
**Impact:** Medium  
**Priority:** ⭐⭐⭐

#### Animal Husbandry Calculator
- [ ] Breeding cost calculator
- [ ] Mount raising time/cost
- [ ] Pedigree impact analysis
- [ ] Market value projections

#### Butcher Calculator
- [ ] Hide/skin profit calculations
- [ ] Focus optimization
- [ ] Multi-tier animal comparison

#### Split Loot Tool
- [ ] Fair loot distribution calculator
- [ ] Market value assessment
- [ ] Repair cost deductions
- [ ] Party member share calculations

---

## Phase 2: PvP Analytics (Q2 2026)

### 2.1 Killboard (MVP) 🔴 HIGH PRIORITY
**Competitors:** AlbionOnlineTools, AlbionBattleHub, KillBoard #1  
**Effort:** 6-8 weeks  
**Impact:** Very High  
**Priority:** ⭐⭐⭐⭐⭐

#### Features (MVP)
- [ ] Kill/death tracking per player
- [ ] Player search functionality
- [ ] Basic statistics (K/D ratio, total kills, total deaths)
- [ ] Recent kills feed
- [ ] Weapon usage statistics
- [ ] Guild battle tracking
- [ ] Kill detail pages (victim, killer, gear, location)
- [ ] API integration with Albion Online Data Project

#### Technical Requirements
- Albion Online Data Project API integration
- Real-time data processing pipeline
- Elasticsearch or similar for fast queries
- Caching layer for performance
- Database schema for kills/deaths

#### Success Metrics
- 10,000+ kills tracked daily
- 5,000+ unique player profiles viewed
- < 2 second page load times

#### Future Enhancements (Post-MVP)
- Specialized kill categories (Stalkers, Lethal Kills, Depths)
- Battle reports aggregation
- Fame tracking per kill
- IP (Item Power) value calculations
- Damage/healing statistics
- Participant tracking

---

### 2.2 Player Statistics Dashboard 🟡 MEDIUM PRIORITY
**Competitors:** AlbionOnlineTools, AlbionOnlineBuilds  
**Effort:** 3-4 weeks  
**Impact:** Medium-High  
**Priority:** ⭐⭐⭐⭐

#### Features
- [ ] Player profile pages
- [ ] Fame history graphs
- [ ] PvP win/loss records
- [ ] Recent builds showcase
- [ ] Guild history
- [ ] Achievement tracking
- [ ] Weapon mastery display
- [ ] Zone activity heatmaps

#### Technical Requirements
- Official Albion Online API integration
- Data aggregation from multiple sources
- Chart/graph visualization library
- Caching for performance

---

### 2.3 Weapon Analytics 🟡 MEDIUM PRIORITY
**Competitors:** KillBoard #1, Murder Ledger  
**Effort:** 2-3 weeks  
**Impact:** Medium  
**Priority:** ⭐⭐⭐

#### Features
- [ ] Weapon usage statistics (global and meta)
- [ ] Win rate per weapon type
- [ ] Popular weapon combinations
- [ ] Weapon tier distribution
- [ ] Counter-pick recommendations
- [ ] Weapon trend analysis over time

---

## Phase 3: Guild Features (Q3 2026)

### 3.1 Guild Management Dashboard 🔴 HIGH PRIORITY
**Competitors:** AlbionBattleHub, AlbionOnlineTools  
**Effort:** 6-8 weeks  
**Impact:** High  
**Priority:** ⭐⭐⭐⭐⭐

#### Features
- [ ] Guild roster management
- [ ] Member roles and permissions
- [ ] Activity tracking (last login, participation)
- [ ] Guild statistics (total fame, kills, territory)
- [ ] Officer dashboard
- [ ] Member notes and tags
- [ ] Recruitment status management
- [ ] Guild bank tracking (basic)

#### Technical Requirements
- Guild API integration
- Role-based access control
- Activity tracking system
- Admin dashboard

#### Success Metrics
- 100+ guilds registered
- 5,000+ guild members
- 60%+ weekly active usage

---

### 3.2 Event Scheduling 🟡 MEDIUM PRIORITY
**Competitors:** AlbionBattleHub  
**Effort:** 3-4 weeks  
**Impact:** Medium-High  
**Priority:** ⭐⭐⭐⭐

#### Features
- [ ] Event creation and management
- [ ] Calendar view (weekly/monthly)
- [ ] RSVP system
- [ ] Event reminders (Discord, email)
- [ ] Event types (ZvZ, GvG, PvE, Social)
- [ ] Post-event reports
- [ ] Attendance tracking
- [ ] Recurring events support

#### Integration
- Discord webhook notifications
- Google Calendar export
- iCal format support

---

### 3.3 Attendance Tracking 🟡 MEDIUM PRIORITY
**Competitors:** AlbionBattleHub  
**Effort:** 2-3 weeks  
**Impact:** Medium  
**Priority:** ⭐⭐⭐

#### Features
- [ ] Event attendance logging
- [ ] Attendance percentage per member
- [ ] Activity score calculations
- [ ] Inactive member alerts
- [ ] Attendance reports for officers
- [ ] Export functionality

---

### 3.4 ZvZ Battle Analysis 🔴 HIGH PRIORITY
**Competitors:** AlbionBattleHub, AlbionOnlineTools  
**Effort:** 6-8 weeks  
**Impact:** High  
**Priority:** ⭐⭐⭐⭐⭐

#### Features
- [ ] Multi-battle aggregation (unique feature)
- [ ] Battle reports with detailed stats
- [ ] Attendance tracking per battle
- [ ] Performance analytics (kills, deaths, fame)
- [ ] Equipment breakdown and IP values
- [ ] Interactive charts and graphs
- [ ] Battle comparison tools
- [ ] Export/share battle reports

#### Unique Value Proposition
- **Multi-battle aggregation** - Combine multiple ZvZs/GvGs into unified reports
- **Fair-value regear pricing** - Auto-calculate regear costs based on market data
- **Performance trends** - Track guild performance over time

---

## Phase 4: Mobile App (Q4 2026)

### 4.1 Mobile App MVP 🔴 HIGH PRIORITY
**Competitors:** AlbiTools (basic), Albion Free Market (data client)  
**Effort:** 10-12 weeks  
**Impact:** Very High  
**Priority:** ⭐⭐⭐⭐⭐

#### Platform Strategy
- **React Native** for cross-platform development (iOS + Android)
- **Shared codebase** with web where possible
- **Native modules** for push notifications

#### Features (MVP)
- [ ] Push notifications for:
  - Island harvest ready
  - Daily reset reminders
  - Conqueror's chest availability
  - Kill notifications (tracked players)
  - Market price alerts
- [ ] Quick price checker
- [ ] Build browser (read-only)
- [ ] Kill feed viewer
- [ ] Basic calculators (crafting, refining)
- [ ] Player/guild search
- [ ] Favorites/bookmarks
- [ ] Offline mode for cached data

#### Technical Requirements
- React Native or Flutter framework
- Firebase for push notifications
- Mobile-optimized API endpoints
- Offline-first architecture
- Mobile analytics (Firebase/Crashlytics)

#### Success Metrics
- 10,000+ downloads in first 3 months
- 4.0+ star rating on app stores
- 40%+ daily active users
- < 3 second app launch time

---

### 4.2 Advanced Mobile Features (Post-MVP)
**Effort:** 6-8 weeks  
**Priority:** ⭐⭐⭐

#### Features
- [ ] Mobile-optimized build creator
- [ ] Camera integration for item scanning
- [ ] Voice search
- [ ] Widget support (iOS/Android)
- [ ] Apple Watch / Wear OS companion app
- [ ] AR feature for gear preview (experimental)

---

## Phase 5: Advanced Features (2027+)

### 5.1 Private Flip System 🟡 MEDIUM PRIORITY
**Competitors:** Albion Free Market (unique selling point)  
**Effort:** 4-6 weeks  
**Impact:** Medium-High  
**Priority:** ⭐⭐⭐⭐

#### Features
- [ ] Optional private flips (hidden from public)
- [ ] Premium user feature
- [ ] Flip performance tracking
- [ ] Profit/loss reporting
- [ ] Copy protection mechanisms
- [ ] Expiration dates for flips

#### Monetization
- Premium feature ($4.99/month or included in premium tier)
- Limited private flips for free users (3 active)
- Unlimited for premium users

---

### 5.2 Automated Regear Calculator 🟡 MEDIUM PRIORITY
**Competitors:** AlbionBattleHub (unique feature)  
**Effort:** 3-4 weeks  
**Impact:** Medium  
**Priority:** ⭐⭐⭐

#### Features
- [ ] Submit death via URL
- [ ] Auto-calculate regear costs
- [ ] Fair-value pricing based on market data
- [ ] Export to guild bank systems
- [ ] Bulk regear calculations
- [ ] Insurance fund tracking

---

### 5.3 Multi-Language Support 🟡 MEDIUM PRIORITY
**Competitors:** AlbionOnlineTools (15+ languages)  
**Effort:** Ongoing  
**Impact:** Medium-High (long-term)  
**Priority:** ⭐⭐⭐⭐

#### Phase 1: Top 5 Languages
- [ ] German (DE)
- [ ] French (FR)
- [ ] Russian (RU)
- [ ] Spanish (ES)
- [ ] Portuguese (PT)

#### Phase 2: Additional Languages
- [ ] Polish (PL)
- [ ] Turkish (TR)
- [ ] Italian (IT)
- [ ] Korean (KO)
- [ ] Chinese (ZH)

#### Implementation
- next-intl already implemented ✅
- Community-driven translation platform
- Translation review process
- RTL language support (Arabic) - future

---

### 5.4 Player-to-Player Marketplace 🟢 LOW PRIORITY
**Competitors:** AlbionOnlineTools (BETA)  
**Effort:** Very High (8-12 weeks)  
**Impact:** Uncertain  
**Priority:** ⭐⭐

#### Considerations
- **High risk** - Potential for scams
- **High effort** - Requires escrow system, dispute resolution
- **Monitor** - Watch AlbionOnlineTools adoption first
- **Alternative** - Partner with existing marketplace

---

### 5.5 Twitch Integration 🟢 LOW PRIORITY
**Competitors:** KillBoard #1, Murder Ledger  
**Effort:** 3-4 weeks  
**Impact:** Low-Medium  
**Priority:** ⭐⭐

#### Features
- [ ] Twitch panel for streamers
- [ ] Kill feed overlays
- [ ] Viewer interaction commands
- [ ] Streamer dashboard
- [ ] Drops campaign integration

---

## Feature Dependencies

### Critical Path
```
Laborer Calculator → Enchant Calculator → Discord Bot
                                    ↓
                              Killboard (MVP)
                                    ↓
                        Guild Dashboard → ZvZ Analysis
                                    ↓
                              Mobile App
```

### API Dependencies
1. **Albion Online Data Project** - Killboard, player stats
2. **Official Albion API** - Player profiles, guild data
3. **Market Data API** - All calculators, price checks
4. **Discord API** - Bot integration

### Technical Debt Prevention
- [ ] Implement comprehensive API caching
- [ ] Rate limiting from day 1
- [ ] Database indexing strategy
- [ ] Performance monitoring (Sentry, DataDog)
- [ ] Automated testing (unit, integration, E2E)
- [ ] Documentation for all APIs

---

## Resource Requirements

### Development Team (Ideal)
- **1 Backend Engineer** - API integrations, database optimization
- **2 Frontend Engineers** - React/Next.js features
- **1 Mobile Engineer** - React Native app
- **1 Designer** - UI/UX for new features
- **0.5 DevOps** - Infrastructure, monitoring

### Timeline Summary
| Phase | Duration | Team Size | Total Person-Weeks |
|-------|----------|-----------|-------------------|
| Phase 1 | 8-10 weeks | 3 | 24-30 |
| Phase 2 | 10-12 weeks | 3-4 | 30-48 |
| Phase 3 | 8-10 weeks | 3-4 | 24-40 |
| Phase 4 | 12-16 weeks | 4-5 | 48-80 |
| **Total 2026** | **38-48 weeks** | **3-5** | **126-198** |

---

## Success Metrics (End of 2026)

### User Growth
- **Monthly Active Users:** 50,000+ (from current baseline)
- **Registered Users:** 25,000+
- **Discord Bot Servers:** 500+
- **Mobile App Downloads:** 10,000+

### Engagement
- **Average Session Duration:** 5+ minutes
- **Pages per Session:** 8+
- **Return Visitor Rate:** 40%+
- **Daily Active Users:** 10,000+

### Feature Adoption
- **Laborer Calculator:** 60% of users
- **Killboard:** 50% of users
- **Discord Bot:** 30% of users
- **Mobile App:** 20% of users

### Revenue (if monetized)
- **Premium Conversion:** 3-5%
- **Monthly Recurring Revenue:** $10,000+
- **Average Revenue Per User:** $0.50+

---

## Risk Assessment

### High Risks
1. **API Rate Limiting** - Albion Online API restrictions
   - **Mitigation:** Aggressive caching, data partnerships
   
2. **Mobile App Adoption** - Crowded app store
   - **Mitigation:** Marketing push, unique features, ASO

3. **Killboard Data Accuracy** - Competing data sources
   - **Mitigation:** Multiple data sources, user corrections

### Medium Risks
1. **Development Delays** - Feature creep
   - **Mitigation:** Strict MVP definitions, phased rollouts

2. **Performance Issues** - Scale challenges
   - **Mitigation:** Load testing, CDN, database optimization

3. **Competitor Response** - Features copied
   - **Mitigation:** Focus on UX, community building

---

## Competitive Positioning Statement

**By end of 2026, AlbionKit will be:**

> "The most comprehensive Albion Online companion platform with best-in-class calculators, real-time PvP analytics, seamless Discord integration, and the only full-featured mobile app—designed for serious players who want to optimize their gameplay across all devices."

**Key Differentiators:**
1. ✅ **Most complete calculator suite** (15+ specialized tools)
2. ✅ **Only full-featured mobile app** with push notifications
3. ✅ **Deep Discord integration** for community engagement
4. ✅ **Superior UX/UI** compared to dated competitor interfaces
5. ✅ **Multi-battle ZvZ analysis** (unique feature)
6. ✅ **Fair-value regear calculator** for guilds

---

## Appendix: Quick Reference

### Feature Priority Matrix
```
                    High Impact
                        ↑
    ┌───────────────────┼───────────────────┐
    │  Mobile App       │  Killboard        │
    │  Discord Bot      │  Laborer Calc     │
    │  Guild Dashboard  │  Enchant Calc     │
    ├───────────────────┼───────────────────┤
    │  Multi-Language   │  Private Flips    │
    │  Twitch Integration│ Regear Calculator│
    │  P2P Marketplace  │  Split Loot       │
    └───────────────────┴───────────────────┘
                        ↓
                    Low Impact
        Low Effort ←    → High Effort
```

### Competitor Feature Gaps (Quick List)
- ❌ Killboard
- ❌ Discord Bot
- ❌ Laborer Calculator
- ❌ Enchantment Calculator
- ❌ Guild Management
- ❌ ZvZ Battle Analysis
- ❌ Mobile App
- ❌ Private Flips
- ❌ Multi-Language (15+)
- ❌ Regear Calculator
- ❌ Split Loot Tool
- ❌ Timers (Daily/Monthly)
- ❌ Animal Husbandry Calculator
- ❌ Butcher Calculator

---

**Document Status:** ✅ Complete  
**Next Review:** Q1 2026 Planning  
**Owner:** Product Team  
**Stakeholders:** Development Team, Community Managers
