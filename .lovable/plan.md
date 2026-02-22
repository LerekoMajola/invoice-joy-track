

## Add Privacy Policy Page at Bottom of Landing Page

### What Changes

Create a Privacy Policy page and add a link to it in the landing page footer.

### 1. Create Privacy Policy Page

**New file: `src/pages/PrivacyPolicy.tsx`**

A standalone page using the same layout as the About page (sticky header with logo + nav buttons, gradient hero banner, content sections, Footer at the bottom). Sections will include:

- Information We Collect (account details, usage data, device information)
- How We Use Your Information (service delivery, communication, improvements)
- Data Storage and Security (encryption, cloud infrastructure, access controls)
- Data Sharing (no selling of data, limited third-party sharing for service delivery only)
- Your Rights (access, correction, deletion, data export)
- Cookies and Tracking
- Children's Privacy
- Changes to This Policy
- Contact Information (support@orionlabs.com)

Content will reference the platform's three systems (BizPro, LawPro, GymPro) and be relevant to the African market.

### 2. Add Route

**File: `src/App.tsx`**

Add a public route: `/privacy-policy` pointing to the new `PrivacyPolicy` component, alongside the existing `/about` route.

### 3. Add Link in Footer

**File: `src/components/landing/Footer.tsx`**

Add a "Privacy Policy" link under the **Company** column (after "Contact Us"), so it appears at the bottom of every page that uses the Footer (Landing, About, and the new Privacy Policy page itself).

### Files Changed

1. `src/pages/PrivacyPolicy.tsx` -- new file with full privacy policy content
2. `src/App.tsx` -- add route
3. `src/components/landing/Footer.tsx` -- add Privacy Policy link

