# CarTalker - 30-Day Autonomous Development Plan
**CTO**: Claude
**CEO**: Evan (At Conference)
**Timeline**: Oct 9 - Nov 9, 2025
**Mission**: Transform CarTalker into a friend-ready, money-saving car advisor

---

## Executive Summary

**The Vision**: CarTalker saves people hundreds of dollars at critical decision moments (tire shops, dealerships, mechanics) through real-time advice, price comparison, and advocacy preparation.

**30-Day Goal**: Ship a testable, beautiful, functional app that Evan can confidently share with friends who will become advocates.

**Core Value Props**:
1. 💰 **Save Money**: Price arbitrage, scam detection, parts markup alerts
2. 🛡️ **Warranty Protection**: Know what's covered, get templates to fight back
3. 🗂️ **Digital File Cabinet**: Never lose a receipt or service record
4. 🤝 **Trusted Advisor**: Like having a car-savvy friend on speed dial

---

## Team Structure

### 👔 CTO (Me - Claude)
- Architecture decisions
- Code reviews
- Risk management
- Daily coordination
- Unblocking agents

### 📊 Product Manager Agent
- Feature prioritization
- Spec writing
- User story refinement
- ROI analysis
- Stakeholder updates (Evan)

### 🎨 UX Designer Agent
- Visual identity (playful notebook vibe)
- Tire mascot creation (NanoBanana)
- Component design system
- User flow optimization
- Accessibility

### 🔧 Backend Engineer Agent
- API integrations (Gemini, NHTSA, pricing)
- Database schema evolution
- Performance optimization
- Data validation
- Security

### 💻 Frontend Engineer Agent
- React/Next.js components
- Voice-to-text integration
- Maps layer
- Responsive design
- Client-side performance

---

## 30-Day Milestones

### Week 1 (Oct 9-15): Foundation + Quick Wins
**Theme**: Make it pretty, make it work locally, get testable

**Deliverables**:
- ✅ Visual redesign: Notebook aesthetic (composition book vibes)
- ✅ Tire mascot character (using NanoBanana API)
- ✅ Receipt OCR validation UI ("Does this look right?")
- ✅ Thumbs up/down rating system for advice
- ✅ Voice-to-text input (Web Speech API)
- ✅ NHTSA recall checking (VIN-based)
- ✅ Check engine code database (basic)

**Success Criteria**:
- Evan can show friends a pretty interface
- Users can log receipts and get confirmations
- Voice input works reliably
- Recall checking returns real data

**Team Assignments**:
- **UX**: Design system + mascot + notebook theme
- **Frontend**: Voice input + rating UI + visual refresh
- **Backend**: NHTSA API + OCR validation + recall logic
- **PM**: Scenario mapping + feature specs

---

### Week 2 (Oct 16-22): Money-Saving Features
**Theme**: Build the scenarios that save users $$$

**Deliverables**:
- ✅ Price comparison engine (tires, parts, services)
- ✅ Maps integration (nearby alternatives)
- ✅ Service scam detection (oil change upsells)
- ✅ "Money saved" tracking & display
- ✅ Email template generation
- ✅ Warranty document parsing
- ✅ Maintenance history analyzer

**Success Criteria**:
- Delta Tire scenario works end-to-end
- Oil change scam detection catches common upsells
- User can generate professional email to dealership
- Money saved counter displays correctly

**Team Assignments**:
- **Backend**: Price APIs, maps, warranty parser, scam logic
- **Frontend**: Comparison UI, maps display, email generator
- **UX**: Money saved visualization, flow optimization
- **PM**: Test scenarios validation

---

### Week 3 (Oct 23-29): Advanced Features
**Theme**: Family accounts, data sharing, social proof

**Deliverables**:
- ✅ Multi-vehicle support (one user, many cars)
- ✅ Family account invites (share vehicles)
- ✅ "Tell a friend" referral feature
- ✅ Parts marketplace integration (RockAuto, AutoZone APIs)
- ✅ Warranty coverage checker (Phil scenario)
- ✅ User feedback/reporting system
- ✅ Data consent & privacy controls

**Success Criteria**:
- User can add family member to see their vehicles
- Parts markup detection works (Phil scenario)
- Referral links generate and track
- Privacy controls are clear and functional

**Team Assignments**:
- **Backend**: Family accounts, permissions, parts APIs, consent
- **Frontend**: Invite UI, sharing controls, referral system
- **UX**: Multi-user flows, privacy UX
- **PM**: Privacy compliance, referral mechanics

---

### Week 4 (Oct 30-Nov 5): Polish & Testing
**Theme**: Bug fixes, performance, real-world testing

**Deliverables**:
- ✅ Performance optimization (load times, API caching)
- ✅ Mobile responsiveness polish
- ✅ Error handling & edge cases
- ✅ Onboarding flow (new users)
- ✅ Help/documentation
- ✅ Analytics (track feature usage)
- ✅ Comprehensive testing checklist

**Success Criteria**:
- All 10 test scenarios work reliably
- Mobile experience is smooth
- New users can onboard without confusion
- No critical bugs
- Performance metrics hit targets (<2s load)

**Team Assignments**:
- **All Agents**: Bug fixes, testing, optimization
- **PM**: Test coverage analysis, analytics setup
- **UX**: Onboarding, help content, polish
- **Frontend**: Performance tuning, mobile fixes
- **Backend**: Caching, error handling, monitoring

---

### Week 5 (Nov 6-9): Demo Prep & Handoff
**Theme**: Package everything for Evan's return

**Deliverables**:
- ✅ Demo video walkthrough (all scenarios)
- ✅ Comprehensive changelog
- ✅ Known issues & technical debt log
- ✅ Deployment guide (when ready for production)
- ✅ User metrics dashboard
- ✅ Next phase roadmap

**Success Criteria**:
- Evan can demo to friends immediately
- All changes documented
- Clear path to production deployment
- Roadmap for next features

---

## Decision-Making Framework

### I Can Do Autonomously (No Approval Needed)
✅ Code refactoring (same functionality)
✅ UI/UX improvements (non-breaking)
✅ Bug fixes
✅ New features from approved roadmap (this doc)
✅ Performance optimizations
✅ Documentation updates
✅ Test scenario implementations

### I Need to Document & Proceed Carefully
⚠️ Database schema changes (document in migrations)
⚠️ Third-party integrations (API rate limits, costs)
⚠️ Privacy/data handling changes (log in DECISIONS_LOG.md)

### I Need to Ask Evan First
❌ External service contracts (paid APIs)
❌ Production deployment
❌ Major architecture pivots
❌ Removing existing features

---

## Resource Inventory

### ✅ What We Have Access To
- **Gemini API Key**: AIzaSyBksqQxD34LaYEc69fHc5AA2nbLUsU4DyY
- **NanoBanana Image Gen**: Full code in /Figma/src/nano-banana.js
- **CarTalker Codebase**: Full read/write access
- **Git**: Can commit freely to feature branches
- **Tools**: Read, Write, Edit, Bash, WebSearch, Glob, Grep
- **Existing Features**: Database, OCR, Chat, Vehicle management

### 🔍 What We Need to Research/Integrate
- **Price Comparison APIs**:
  - Tire: Tire Rack, Discount Tire, Costco (web scraping or APIs)
  - Parts: RockAuto API, AutoZone, O'Reilly's
- **Maps**: Google Maps API (or free alternative: Mapbox, Leaflet + OSM)
- **NHTSA API**: Free, already documented
- **Vehicle Data**: VIN decoder (free options: VPIC, vindecoder.eu)
- **Voice**: Web Speech API (built into browsers)
- **Warranty Parsing**: OCR + rule matching (build custom)

### 💸 Budget Considerations
- **Gemini API**: Pay-as-you-go (Evan said don't worry about budget)
- **Other APIs**: Prefer free tiers initially, flag if paid needed
- **Hosting**: Local only for now (Vercel/Railway later)

---

## Git Strategy

### Branching
- `main`: Stable, known-good code
- `feature/design-system`: Visual redesign + mascot
- `feature/voice-input`: Voice-to-text
- `feature/price-comparison`: Delta Tire scenario
- `feature/email-generator`: Phil scenario
- `feature/family-accounts`: Multi-user support

### Commit Hygiene
- Descriptive messages: "Add voice-to-text with Web Speech API"
- Frequent commits (every logical unit)
- Tag stable milestones: `v0.2-week1`, `v0.3-week2`

### Testing Gates
- Before marking feature "done": Manual smoke test against scenario
- Document test results in TESTING_CHECKLIST.md
- No merges to main without validation

---

## Continuity Documents (Survive Context Refreshes)

### Living Docs (Updated Throughout)
- **PROJECT_MASTER_PLAN.md** (this file): North star, milestones
- **TEAM_DAILY_STANDUP.md**: What each agent did today
- **DECISIONS_LOG.md**: Why we made key architectural choices
- **TECHNICAL_DEBT.md**: Known issues, shortcuts, "TODO: fix later"
- **TESTING_CHECKLIST.md**: Validation steps for each scenario
- **TEST_SCENARIOS.md**: The 10 scenarios (already created)

### Read-Only Reference
- **PROJECT_CONTEXT.md**: Original vision
- **FEATURES_ROADMAP.md**: Long-term feature list
- **PROGRESS.md**: Session-by-session progress

---

## Risk Mitigation

### Top Risks & Mitigation Plans

**Risk 1**: Breaking existing features while adding new ones
**Mitigation**:
- Work in feature branches
- Don't touch core DB schema without careful migration
- Test vehicle/maintenance flows after each change

**Risk 2**: API integrations fail or rate limit
**Mitigation**:
- Mock APIs first (fake data)
- Implement graceful fallbacks
- Cache aggressively
- Document API limits in code comments

**Risk 3**: Context refresh loses progress
**Mitigation**:
- Update living docs after every session
- Git commits every 30 minutes
- TEAM_DAILY_STANDUP.md tracks what's in-flight

**Risk 4**: Privacy/data handling mistakes
**Mitigation**:
- No user data leaves device initially
- Explicit consent for any sharing
- Document all data flows in DECISIONS_LOG.md

**Risk 5**: Scope creep / perfectionism
**Mitigation**:
- Focus on "working testable" over "perfect"
- Each week has specific deliverables
- PM agent keeps scope in check

---

## Success Metrics (How We Know We Won)

### Week 1 Success
- [ ] Visual redesign complete (playful, notebook vibe)
- [ ] Tire mascot exists and is delightful
- [ ] Voice input works on mobile & desktop
- [ ] Recall checking returns real NHTSA data
- [ ] Receipt validation UI functional

### Week 2 Success
- [ ] Delta Tire scenario works end-to-end
- [ ] Price comparison shows 3+ alternatives
- [ ] Maps display nearby shops
- [ ] Email generator creates professional templates
- [ ] Money saved counter displays

### Week 3 Success
- [ ] Family accounts functional
- [ ] Phil scenario works (parts markup detection)
- [ ] Warranty coverage checker works
- [ ] Referral system generates links

### Week 4 Success
- [ ] All 10 scenarios pass manual testing
- [ ] Mobile experience is smooth
- [ ] Load time <2s
- [ ] No critical bugs

### Final Success (When Evan Returns)
- [ ] Evan demos to 3 friends
- [ ] Friends say "I want this!"
- [ ] At least 5 friends actively using
- [ ] Captured real-world "money saved" story
- [ ] Evan trusts the autonomous work

---

## Communication Plan

### Daily Standups (In TEAM_DAILY_STANDUP.md)
Each agent reports:
- What I did yesterday
- What I'm doing today
- Blockers

### Milestone Reports (End of Each Week)
- Deliverables completed
- Blockers encountered
- Decisions made
- Next week preview

### Final Handoff (When Evan Returns)
- Demo walkthrough
- Comprehensive changelog
- Known issues
- Recommended next steps

---

## Next Actions (Starting NOW)

1. **UX Agent**: Design tire mascot prompt, generate with NanoBanana
2. **UX Agent**: Create design system (colors, fonts, components)
3. **Frontend Agent**: Implement voice-to-text input
4. **Backend Agent**: Integrate NHTSA recall API
5. **Frontend Agent**: Build rating UI (thumbs up/down)
6. **PM Agent**: Write detailed feature specs for Week 1 deliverables

All agents can work in parallel. CTO (me) will coordinate and unblock.

---

## Appendix: Technical Architecture Notes

### Stack
- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API routes
- **Database**: Prisma + SQLite (local), migrate to PostgreSQL later
- **AI**: Google Gemini (chat, OCR, image generation)
- **Storage**: Local filesystem (images, PDFs)
- **Voice**: Web Speech API (browser native)
- **Maps**: TBD (Google Maps vs Mapbox)

### Key Patterns
- **OCR Pipeline**: Upload → Gemini Vision → Parse → Confirm → Save
- **Voice Flow**: Record → Web Speech API → Transcript → Process
- **Price Comparison**: Query → Scrape/API → Aggregate → Present
- **Email Gen**: Template + Context → Gemini → Format → Copy

### Performance Targets
- Initial load: <2s
- API responses: <1s
- Voice transcription: <3s
- Image OCR: <5s

---

*This document is the single source of truth for the autonomous sprint. All agents refer back here for priorities and alignment.*

**Last Updated**: Oct 9, 2025
**Status**: Ready to Execute
**Approval Needed**: Evan (before conference departure)
