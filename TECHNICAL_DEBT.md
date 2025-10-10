# Technical Debt & Known Issues

## Purpose
Track shortcuts, hacks, and "TODO: fix later" items that need attention.

---

## Current Debt (Oct 9, 2025)

### Priority: Low

#### NanoBanana Image Generation Integration
**Created**: Oct 9, 2025
**Priority**: Low
**Issue**: Gemini image generation API not accessible via current Node SDK
**Why**: Need mascot generation, but SDK doesn't support Imagen models yet
**Fix**:
- Research correct Imagen API access method
- May need to use REST API directly instead of SDK
- Or wait for SDK update
- Alternative: Use DALL-E or Midjourney
**Current Solution**: Using simple SVG mascot (looks great, works immediately)
**Effort**: 2-3 hours research + implementation
**Risk**: Low - SVG mascot is functional and on-brand

---

## Template for Logging Debt

### [Component/Feature Name]
**Created**: [Date]
**Priority**: High | Medium | Low
**Issue**: [What's wrong]
**Why**: [Why we did it this way]
**Fix**: [What needs to happen]
**Effort**: [Time estimate]
**Risk**: [What breaks if we don't fix]

---

## Resolved Debt
*Items that have been paid down*
