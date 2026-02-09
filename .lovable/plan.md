

# Refresh Landing Page and Auth to Reflect All 5 Industries

## Problem

The landing page is frozen on "Smart School Management" branding. The Hero shows a GraduationCap, the Solutions section says "Built for Private Schools" with school-only features, the auth branding panel only mentions quotes/invoices/CRM, and the footer is missing Legal and Tool Hire entirely. The platform now serves **5 industries** and the public-facing pages need to reflect that.

## What Changes

### 1. Hero (Hero.tsx) -- Industry-Agnostic with Animated Icons

**Current:** Single GraduationCap icon, "Smart School Management" headline.

**New:**
- Replace the single icon with a row of 5 floating industry icons (Briefcase, Wrench, GraduationCap, Scale, Hammer) that gently animate with staggered delays
- Headline changes to: **"One Platform,** **Every Industry"** (or similar multi-vertical headline)
- Subtitle updates to: "Business operations, workshop management, school admin, legal practice, and equipment hire -- all powered by one modular platform."
- Add a "Solutions" anchor link in the nav alongside Features and Pricing
- Keep the existing CTA buttons and trust line

### 2. Solutions (Solutions.tsx) -- 5 Industry Showcase Cards

**Current:** 9 school-specific feature cards with "Built for Private Schools" badge.

**New:** Replace with 5 large industry vertical cards, each showing:
- Industry icon with its signature gradient
- Industry name (Business, Workshop, School, Legal, Tool Hire)
- 3-4 bullet points of key features for that industry
- Starting price
- "Get Started" link that deep-links to `/auth?system=xxx`

Each card uses the same gradient colours already defined in SystemSelector (primary-to-violet for Business, coral-to-warning for Workshop, etc.). The section header changes to "Solutions for Every Industry" with a subtitle about the modular approach.

### 3. Auth Branding Panel (AuthBrandingPanel.tsx) -- Multi-Industry

**Current:** "Manage Your Business Operations", feature pills only show Quotes/Invoices/CRM/Tasks.

**New:**
- Headline: "One Platform, Five Industries"
- Subtitle: broader description covering all verticals
- Feature pills expand to show a rotating set: Business, Workshop, School, Legal, Tool Hire (the industry names themselves)
- Testimonial stays but the "Trusted by" line changes to "Trusted by 5000+ organisations" (not just businesses)

### 4. Footer (Footer.tsx) -- All 5 Systems

**Current:** 3 columns -- Business Management, Workshop & School, Company.

**New:** Reorganise into:
- Brand column (stays)
- "Solutions" column listing all 5 systems with links to `/auth?system=xxx`
- "Features" column listing shared capabilities (Invoices, Staff, Accounting, Tasks)
- "Company" column (Sign In, Free Trial, Contact)
- Description updates to: "The modular platform for businesses, workshops, schools, law firms, and rental companies across Africa."

### 5. Auth.tsx -- Fix Hire Deep-Link

**Current (line 38):** The URL param check excludes `'hire'`:
```ts
if (systemParam && ['business', 'workshop', 'school', 'legal'].includes(systemParam) ...
```

**Fix:** Add `'hire'` to the array so `/auth?system=hire` works correctly.

## Files Summary

| File | Action |
|------|--------|
| `src/components/landing/Hero.tsx` | Rewrite -- multi-industry headline, 5 animated icons, updated copy |
| `src/components/landing/Solutions.tsx` | Rewrite -- 5 industry vertical cards replacing school-only features |
| `src/components/landing/Features.tsx` | Minor -- keep as-is (already generic "Built for the Way You Work") |
| `src/components/landing/Footer.tsx` | Update -- add Legal + Tool Hire, reorganise columns |
| `src/components/auth/AuthBrandingPanel.tsx` | Update -- multi-industry headline, broader pills and copy |
| `src/pages/Auth.tsx` | Fix -- add `'hire'` to system param validation array |

## Technical Notes

- All 5 industry gradients are reused from `SystemSelector.tsx` for consistency
- Deep-links use the existing `/auth?system=xxx` pattern
- The animated floating icons in the Hero use staggered `animationDelay` on the existing `animate-float` class
- No new dependencies needed; all icons already imported from lucide-react across the codebase
- The Solutions cards link directly to signup with `?system=` pre-filled, same as the PricingTable cards

