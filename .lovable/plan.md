
# Add a Public "About" Page for Sharing

Create a dedicated `/about` page that presents the Orion Labs features and benefits in a professional, shareable format. You can send anyone the link (e.g. `https://orionlabslesotho.com/about`) and they'll see everything they need to know -- no login required.

## What You'll Get

A beautifully designed, single-page overview covering:
- Platform introduction and value proposition
- The six industry solutions with key features
- Core platform capabilities (invoicing, staff management, accounting, etc.)
- Technology highlights (PWA, cloud-based, secure)
- Pricing summary with a clear call-to-action
- A sticky header with navigation back to the main site and a "Start Free Trial" button

The page will reuse the existing landing page styling (gradients, animations, cards) for a consistent, professional look.

## Link for Sharing

Once built, you can share: **orionlabslesotho.com/about**

## Navigation

- A link to the About page will be added to the landing page header nav and footer
- The About page itself will have a header linking back to home and to Sign In

---

## Technical Details

### New File: `src/pages/About.tsx`

A public page component containing:

1. **Hero banner** -- "About Orion Labs" with a brief tagline
2. **Platform Overview section** -- what the platform is, who it's for
3. **Industry Solutions grid** -- reuses the same 6-industry data from the Solutions component, presented in detailed cards with expanded feature lists
4. **Core Features section** -- shared capabilities across all industries (Invoicing, Staff/Payroll, Accounting, CRM, Task Management, Document Branding)
5. **Technology and Security section** -- PWA, cloud, SSL encryption, role-based access
6. **Pricing overview** -- summary table with "from" prices per industry and a CTA button
7. **Footer** -- reuses the existing `Footer` component

### Modified File: `src/App.tsx`

- Import the new `About` page
- Add route: `<Route path="/about" element={<About />} />`

### Modified File: `src/components/landing/Hero.tsx`

- Add "About" link to the header navigation (alongside Solutions, Features, Pricing)

### Modified File: `src/components/landing/Footer.tsx`

- Add "About" link under the Company column
