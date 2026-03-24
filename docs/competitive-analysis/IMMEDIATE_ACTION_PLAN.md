# AlbionKit - Immediate Action Plan

**Created:** March 24, 2026  
**Focus:** Q1 2026 High-Priority Features  
**Goal:** Achieve competitive parity on core features

---

## 🎯 Top 3 Immediate Priorities

### 1️⃣ Laborer Calculator (2-3 weeks)
**Why:** Offered by both AlbionOnlineGrind and Albion Free Market - table stakes for economy tools

**Action Items:**
- [ ] **Week 1:** Research & Design
  - [ ] Analyze AlbionOnlineGrind laborer calculator
  - [ ] Analyze Albion Free Market laborer calculator
  - [ ] Create UI/UX mockups
  - [ ] Define data requirements (journal prices, laborer types)
  
- [ ] **Week 2-3:** Development
  - [ ] Create database schema for laborer types
  - [ ] Implement journal price API integration
  - [ ] Build calculator logic (focus optimization, profit calc)
  - [ ] Create frontend components
  - [ ] Add multi-city comparison
  
- [ ] **Week 3:** Testing & Launch
  - [ ] Unit tests for calculations
  - [ ] User acceptance testing
  - [ ] Performance optimization
  - [ ] Deploy to production
  - [ ] Announce to community

**Success Criteria:**
- ✅ Accurate profit calculations (verified against competitors)
- ✅ All 8 laborer types supported
- ✅ All 7 royal cities + Black Market
- ✅ Focus optimization recommendations
- ✅ < 2 second calculation time

---

### 2️⃣ Enchantment Calculator (2-3 weeks)
**Why:** Essential for endgame gearing, offered by AlbionOnlineGrind

**Action Items:**
- [ ] **Week 1:** Research & Design
  - [ ] Research enchantment success rate formulas
  - [ ] Gather rune/relic/soul market data requirements
  - [ ] Create UI mockups
  - [ ] Define calculation logic
  
- [ ] **Week 2-3:** Development
  - [ ] Enchantment cost calculator (4.0-4.3)
  - [ ] Material breakdown (runes, relics, souls)
  - [ ] Success rate display
  - [ ] Enchant vs buy analysis
  - [ ] Optimal path recommendations
  
- [ ] **Week 3:** Testing & Launch
  - [ ] Verify calculations with community data
  - [ ] Unit tests
  - [ ] Deploy
  - [ ] Community announcement

**Success Criteria:**
- ✅ Accurate enchantment cost calculations
- ✅ All enchantment levels (4.0, 4.1, 4.2, 4.3)
- ✅ Real-time rune/relic/soul prices
- ✅ Clear success rate display
- ✅ Actionable recommendations

---

### 3️⃣ Discord Bot MVP (3-4 weeks)
**Why:** Community integration essential, offered by 3+ major competitors

**Action Items:**
- [ ] **Week 1:** Setup & Infrastructure
  - [ ] Create Discord application
  - [ ] Setup discord.js or similar framework
  - [ ] Database schema for user preferences
  - [ ] Basic bot structure
  
- [ ] **Week 2-3:** Core Features
  - [ ] Kill/death notifications for tracked players
  - [ ] Market price alerts (threshold-based)
  - [ ] Daily reset timer reminders
  - [ ] Basic commands: `!price`, `!build`, `!stats`
  - [ ] Server selection (Americas, Europe, Asia)
  
- [ ] **Week 4:** Testing & Launch
  - [ ] Beta test with community volunteers
  - [ ] Rate limiting implementation
  - [ ] Performance optimization
  - [ ] Public launch
  - [ ] Documentation creation

**Success Criteria:**
- ✅ 100+ Discord server installations in first month
- ✅ < 5 second notification delay
- ✅ 99.9% uptime
- ✅ Clear documentation
- ✅ Active community feedback loop

---

## 📋 Development Sprint Plan

### Sprint 1 (Weeks 1-2): Laborer Calculator Foundation
**Goals:**
- Complete research and design
- Database schema created
- API integrations working
- Basic calculator functional

**Deliverables:**
- UI mockups approved
- Laborer types database
- Journal price API integration
- Basic profit calculation

---

### Sprint 2 (Weeks 3-4): Laborer Launch + Enchant Start
**Goals:**
- Launch Laborer Calculator
- Start Enchantment Calculator research

**Deliverables:**
- ✅ Laborer Calculator live
- Community announcement
- Enchantment research complete

---

### Sprint 3 (Weeks 5-6): Enchantment Calculator
**Goals:**
- Complete Enchantment Calculator
- Launch to production

**Deliverables:**
- ✅ Enchantment Calculator live
- Accurate success rate formulas
- Material cost tracking

---

### Sprint 4 (Weeks 7-8): Discord Bot Foundation
**Goals:**
- Discord bot infrastructure
- Core notification system

**Deliverables:**
- Bot framework setup
- Kill notification system
- Market alert system

---

### Sprint 5 (Weeks 9-10): Discord Bot Launch
**Goals:**
- Complete Discord Bot
- Public launch

**Deliverables:**
- ✅ Discord Bot live
- 100+ server installations
- Documentation complete

---

## 🔧 Technical Requirements

### API Integrations Needed
1. **Albion Online Data Project**
   - Kill data for Discord notifications
   - Player statistics
   
2. **Market Data API**
   - Journal prices (Laborer Calculator)
   - Rune/relic/soul prices (Enchant Calculator)
   - All 7 royal cities + Black Market

3. **Discord API**
   - Bot integration
   - Webhook support
   - Rate limiting

### Database Changes
```sql
-- Laborer Types Table
CREATE TABLE laborer_types (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  specialty VARCHAR,
  journal_type VARCHAR,
  base_return_rate DECIMAL
);

-- Enchantment Materials Table
CREATE TABLE enchantment_materials (
  id VARCHAR PRIMARY KEY,
  name VARCHAR,
  type ENUM('runes', 'relics', 'souls'),
  tier INTEGER,
  current_price INTEGER
);

-- Discord User Preferences Table
CREATE TABLE discord_preferences (
  discord_id VARCHAR PRIMARY KEY,
  tracked_players JSON,
  price_alerts JSON,
  server_region VARCHAR,
  notification_channels JSON
);
```

### New Components to Create
```
src/
├── app/
│   ├── tools/
│   │   ├── laborer-calculator/
│   │   │   ├── page.tsx
│   │   │   └── LaborerCalculatorClient.tsx
│   │   └── enchant-calculator/
│   │       ├── page.tsx
│   │       └── EnchantCalculatorClient.tsx
├── components/
│   ├── calculators/
│   │   ├── LaborerCalculator.tsx
│   │   └── EnchantCalculator.tsx
│   └── discord/
│       └── DiscordBotHandler.ts
└── lib/
    ├── calculators/
    │   ├── laborer-calculator.ts
    │   └── enchant-calculator.ts
    └── discord/
        └── bot.ts
```

---

## 📊 Success Metrics (Q1 2026)

### User Engagement
- [ ] Laborer Calculator: 40% of users try within first week
- [ ] Enchantment Calculator: 30% of build creators use
- [ ] Discord Bot: 100+ server installations
- [ ] Overall session duration: +20% increase

### Technical Performance
- [ ] Calculator load time: < 2 seconds
- [ ] Discord notification delay: < 5 seconds
- [ ] API error rate: < 1%
- [ ] Zero critical bugs

### Community Feedback
- [ ] User satisfaction: > 4/5 rating
- [ ] Feature requests: < 10% negative feedback
- [ ] Discord community growth: +25%
- [ ] Social media mentions: +50%

---

## 🚀 Go-to-Market Plan

### Pre-Launch (1 week before)
- [ ] Teaser posts on Discord
- [ ] Sneak peek screenshots
- [ ] Beta tester recruitment
- [ ] Press release draft

### Launch Day
- [ ] Discord announcement
- [ ] Twitter/X post
- [ ] Reddit r/albiononline post
- [ ] YouTube community post
- [ ] Update homepage feature showcase

### Post-Launch (1 week after)
- [ ] Collect user feedback
- [ ] Bug fix sprint
- [ ] Feature iteration based on feedback
- [ ] Success metrics review

---

## 🎨 Design Requirements

### Laborer Calculator
- Clean, table-based layout
- City comparison view
- Focus optimization highlights
- Profit/loss color coding (green/red)
- Export/share functionality

### Enchantment Calculator
- Gear visualization
- Success rate progress bars
- Material cost breakdown
- Enchant level selector (4.0-4.3)
- Comparison mode (enchant vs buy)

### Discord Bot
- Clean embed designs
- Clear call-to-action buttons
- Mobile-friendly notifications
- Rate limit warnings
- Help documentation links

---

## 📝 Documentation Needed

### User Documentation
- [ ] Laborer Calculator guide
- [ ] Enchantment Calculator tutorial
- [ ] Discord Bot commands reference
- [ ] FAQ for each feature
- [ ] Video tutorials (YouTube)

### Developer Documentation
- [ ] API documentation
- [ ] Database schema docs
- [ ] Deployment guide
- [ ] Monitoring setup
- [ ] Troubleshooting guide

---

## ⚠️ Risk Mitigation

### Risk 1: API Rate Limiting
**Mitigation:**
- Implement aggressive caching (Redis)
- Batch API requests
- Fallback to stale data if needed
- Monitor API usage daily

### Risk 2: Calculation Accuracy
**Mitigation:**
- Cross-reference with 2+ competitors
- Community beta testing
- User feedback mechanism
- Easy correction process

### Risk 3: Discord Bot Downtime
**Mitigation:**
- Health monitoring (uptime robot)
- Auto-restart on failure
- Clear status page
- Backup notification system

### Risk 4: Feature Creep
**Mitigation:**
- Strict MVP definitions
- Phase 2 features documented but deferred
- Weekly priority reviews
- Say "no" to nice-to-haves

---

## 💰 Budget Estimate

### Development Costs (If outsourcing)
- Laborer Calculator: $3,000-5,000
- Enchantment Calculator: $2,500-4,000
- Discord Bot: $4,000-6,000
- **Total:** $9,500-15,000

### Infrastructure Costs (Monthly)
- Additional database storage: $20-50
- Redis caching: $15-30
- Discord bot hosting: $10-20
- Monitoring tools: $30-50
- **Total:** $75-150/month

### Marketing Costs (Optional)
- Discord server boost: $100/month
- Social media ads: $200-500/month
- Content creator sponsorships: $500-1,000
- **Total:** $800-1,600/month

---

## 🎯 Next Steps (This Week)

### Monday
- [ ] Team kickoff meeting
- [ ] Assign feature owners
- [ ] Setup project boards (Jira/Trello)
- [ ] Create GitHub issues

### Tuesday-Wednesday
- [ ] Laborer Calculator research complete
- [ ] UI mockups started
- [ ] Database schema finalized

### Thursday-Friday
- [ ] Laborer Calculator development begins
- [ ] Enchantment Calculator research starts
- [ ] Discord bot application submitted

### Weekend
- [ ] Rest 😊
- [ ] Community teaser post

---

## 📞 Stakeholder Communication

### Weekly Updates
- **When:** Every Monday 10 AM
- **Who:** Development team, product owner
- **What:** Progress review, blockers, next week's goals

### Bi-Weekly Demos
- **When:** Every other Friday 2 PM
- **Who:** Entire team + stakeholders
- **What:** Feature demos, feedback collection

### Monthly Reports
- **When:** First day of each month
- **Who:** Product owner → leadership
- **What:** Metrics review, roadmap adjustments

---

**Status:** 🟢 Ready to Start  
**Next Review:** End of Sprint 1 (2 weeks)  
**Questions?** Contact Product Team

---

## Appendix: Competitor References

### Laborer Calculator Examples
- AlbionOnlineGrind: https://albiononlinegrind.com/laborers
- Albion Free Market: https://albionfreemarket.com/laborers

### Enchantment Calculator Examples
- AlbionOnlineGrind: https://albiononlinegrind.com/enchanting
- AlbionCalculator: https://albioncalculator.com/enchant

### Discord Bot Examples
- AlbionOnlineTools: Invite link from their site
- AlbionBattleHub: Available on their Discord server
