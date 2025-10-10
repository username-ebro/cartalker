# Architecture Decision Records (ADRs)

## Format
Each decision includes:
- **Date**: When decided
- **Decision**: What we chose
- **Context**: Why it mattered
- **Alternatives**: What we didn't choose
- **Consequences**: Trade-offs

---

## Oct 9, 2025 - Initial Architecture Decisions

### ADR-001: Use Web Speech API for Voice Input
**Decision**: Implement voice-to-text using browser-native Web Speech API

**Context**:
- Need voice input for real-time scenarios (user at tire shop)
- Budget-conscious (Evan said don't worry, but free is better)
- Needs to work on mobile & desktop

**Alternatives Considered**:
1. OpenAI Whisper API ($0.006/minute) - High accuracy, cost
2. Google Cloud Speech-to-Text ($0.006/15sec) - High accuracy, cost
3. Web Speech API (free) - Native browser support, good enough

**Decision Rationale**: Web Speech API is free, works across browsers, good accuracy for English, no API limits

**Consequences**:
- ✅ Zero cost
- ✅ Fast (no network latency)
- ✅ Works offline
- ⚠️ Browser support varies (graceful fallback needed)
- ⚠️ Accuracy not perfect (but acceptable)

---

### ADR-002: SQLite for Local Development, PostgreSQL Later
**Decision**: Keep SQLite for local dev, migrate to PostgreSQL when deploying

**Context**:
- Already using Prisma + SQLite
- Local development only for now
- Easy migration path to PostgreSQL

**Alternatives**:
1. PostgreSQL now - Production-ready, overkill for local dev
2. MySQL - Common, but Prisma works better with PostgreSQL
3. SQLite (chosen) - Simple, file-based, perfect for local

**Consequences**:
- ✅ Zero setup for local dev
- ✅ Fast queries (small dataset)
- ✅ Easy backup (just copy file)
- ⚠️ Migration needed before multi-user production
- ⚠️ No concurrent writes (fine for single user)

---

### ADR-003: NanoBanana (Gemini Image Gen) for Mascot
**Decision**: Use existing NanoBanana integration from Figma project

**Context**:
- Need to generate Tireman mascot
- Already have Gemini API key and code
- Cheaper than DALL-E ($30 per 1M tokens vs OpenAI)

**Alternatives**:
1. DALL-E 3 ($0.04/image) - High quality, expensive
2. Midjourney - Manual, not API accessible
3. Free stock art - Generic, not custom
4. NanoBanana (Gemini) - ~$0.04/image, API ready

**Consequences**:
- ✅ Reuse existing code
- ✅ Cost-effective
- ✅ Fast generation
- ⚠️ Quality may vary (test and iterate)

---

### ADR-004: TailwindCSS for Styling
**Decision**: Continue using TailwindCSS (already in project)

**Context**: Already using Tailwind 4, works well with Next.js

**Consequences**:
- ✅ Rapid prototyping
- ✅ Consistent design system
- ✅ Good mobile-first support

---

## Template for Future ADRs

### ADR-XXX: [Title]
**Date**: [Date]
**Decision**: [What we chose]

**Context**: [Why it mattered]

**Alternatives Considered**:
1. Option A - Pros/cons
2. Option B - Pros/cons

**Decision Rationale**: [Why we chose this]

**Consequences**:
- ✅ Benefit 1
- ✅ Benefit 2
- ⚠️ Trade-off 1
- ❌ Downside 1
