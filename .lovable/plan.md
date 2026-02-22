

## Reflect 3-Vertical Consolidation Across All Public Pages

### Summary

Multiple landing page components, the About page, auth branding panel, footer, and testimonials data still reference the old 8-vertical structure. This plan updates all copy, icons, data arrays, and layouts to consistently present only **BizPro, LawPro, and GymPro** -- while highlighting that BizPro offers optional add-on modules (workshop, hire, school, guesthouse, fleet).

---

### Files to Change

#### 1. `src/components/landing/Hero.tsx`
- Reduce `industries` array from 8 to 3 (BizPro, LawPro, GymPro)
- Remove unused icon imports (Wrench, GraduationCap, Hammer, Hotel, Car)
- Change heading from "One Platform, Every Industry" to "One Platform, Three Solutions"
- Update subtitle from listing all 8 names to: "BizPro, LawPro & GymPro -- modular business management for companies, law firms, and fitness centres."

#### 2. `src/components/landing/Solutions.tsx`
- Reduce `industries` array from 8 to 3 cards (BizPro, LawPro, GymPro)
- Expand BizPro features list to mention add-on modules (e.g. "Workshop, Fleet, Hire & more available as add-ons")
- Change badge from "8 Industries, 1 Platform" to "3 Solutions, 1 Platform"
- Update heading/subtitle copy accordingly
- Change grid from 5 columns to 3 columns
- Remove unused icon imports

#### 3. `src/components/landing/Footer.tsx`
- Remove ShopPro, EduPro, HirePro, StayPro, FleetPro links from "Solutions" column
- Keep only BizPro, LawPro, GymPro links
- Update brand description to: "The modular platform for businesses, law firms, and fitness centres across Africa."

#### 4. `src/components/auth/AuthBrandingPanel.tsx`
- Reduce `industries` array from 8 to 3 pills (BizPro, LawPro, GymPro)
- Change heading from "One Platform, Eight Industries" to "One Platform, Three Solutions"
- Update subtitle to list only the 3 verticals
- Remove unused icon imports

#### 5. `src/pages/About.tsx`
- Replace the 6-item `industries` array with 3 entries: BizPro (with expanded description noting add-on modules), LawPro, GymPro
- Change badge from "6 Industries, 1 Platform" to "3 Solutions, 1 Platform"
- Update hero subtitle to reference only the 3 verticals
- Update "What Is Orion Labs?" body copy to reflect the 3-vertical model with BizPro add-ons
- Update pricing table to show only 3 rows
- Remove unused icon imports (Wrench, GraduationCap, Hammer, Hotel)

#### 6. `src/data/testimonials.ts`
- Re-brand the ShopPro, EduPro, HirePro, StayPro, FleetPro testimonials to show "BizPro" as the product (since those are now BizPro modules)
- Update their `accentColor` and `cardBg` to match BizPro's indigo theme
- Keep the testimonial quotes but adjust wording slightly (e.g. "ShopPro" becomes "the Workshop module", "EduPro" becomes "the School module", etc.)

---

### What Stays Unchanged

| File | Reason |
|------|--------|
| `Features.tsx` | Generic platform features, no vertical references |
| `Coverage.tsx` | Geographic coverage, no vertical references |
| `PricingTable.tsx` | Already updated to 3 tabs |
| `Testimonials.tsx` | Just renders from data, no structural change needed |

