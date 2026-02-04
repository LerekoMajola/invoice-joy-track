
# Rebrand SaaS Platform to Orion Labs

## Overview
Replace all "Leekay" SaaS branding with "Orion Labs" throughout the application. The individual business data (like "Leekay Group of Companies" stored in the database) will remain untouched as it's managed per-user in the `company_profiles` table.

---

## Brand Changes

Based on the uploaded logo:
- **New Name**: Orion Labs
- **Primary Color**: Navy blue (#1a2a4a)
- **Logo Style**: "Orion" with stars in the "O", "LABS" underneath

---

## Files to Update

### 1. Logo Asset
- Save uploaded logo as `src/assets/orion-labs-logo.png`

### 2. Landing Page Components

| File | Changes |
|------|---------|
| `src/components/landing/Hero.tsx` | Import new logo, update alt text |
| `src/components/landing/Footer.tsx` | Import new logo, update text to "Orion Labs", email to `support@orionlabs.com` |

### 3. Auth & Layout

| File | Changes |
|------|---------|
| `src/pages/Auth.tsx` | Import new logo, change "Get started with Leekay today" to "Get started with Orion Labs today" |
| `src/components/layout/Sidebar.tsx` | Import new logo, update alt text |

### 4. Billing Page

| File | Changes |
|------|---------|
| `src/pages/Billing.tsx` | Change `support@leekay.com` to `support@orionlabs.com` |

### 5. HTML & PWA Config

| File | Changes |
|------|---------|
| `index.html` | Update title, meta tags, theme-color to navy blue |
| `vite.config.ts` | Update PWA manifest name, short_name, theme_color |

### 6. CSS Theme

| File | Changes |
|------|---------|
| `src/index.css` | Update `--primary` color to navy blue (~230 35% 18%) |

---

## Detailed Changes

### src/components/landing/Hero.tsx
```
- import leekayLogo from '@/assets/leekay-logo.png'
+ import orionLabsLogo from '@/assets/orion-labs-logo.png'

- src={leekayLogo} alt="Leekay"
+ src={orionLabsLogo} alt="Orion Labs"
```

### src/components/landing/Footer.tsx
```
- import leekayLogo from '@/assets/leekay-logo.png'
+ import orionLabsLogo from '@/assets/orion-labs-logo.png'

- src={leekayLogo} alt="Leekay"
+ src={orionLabsLogo} alt="Orion Labs"

- "designed for businesses in Lesotho"
+ "designed for your business"

- mailto:support@leekay.com
+ mailto:support@orionlabs.com

- "Leekay. All rights reserved"
+ "Orion Labs. All rights reserved"
```

### src/components/layout/Sidebar.tsx
```
- import leekayLogo from '@/assets/leekay-logo.png'
+ import orionLabsLogo from '@/assets/orion-labs-logo.png'

- src={leekayLogo} alt="Leekay"
+ src={orionLabsLogo} alt="Orion Labs"
```

### src/pages/Auth.tsx
```
- import leekayLogo from '@/assets/leekay-logo.png'
+ import orionLabsLogo from '@/assets/orion-labs-logo.png'

- src={leekayLogo} alt="Leekay" (line 101)
+ src={orionLabsLogo} alt="Orion Labs"

- src={leekayLogo} alt="Leekay" (line 117)
+ src={orionLabsLogo} alt="Orion Labs"

- "Get started with Leekay today"
+ "Get started with Orion Labs today"

- "designed for businesses in Lesotho"
+ "designed for your business"
```

### src/pages/Billing.tsx
```
- support@leekay.com
+ support@orionlabs.com
```

### index.html
```html
<title>Orion Labs</title>
<meta name="description" content="Orion Labs - Professional Business Management Platform">
<meta name="author" content="Orion Labs" />
<meta name="theme-color" content="#1a2a4a" />
<meta name="apple-mobile-web-app-title" content="Orion Labs" />
<meta name="twitter:site" content="@OrionLabsHQ" />
<meta property="og:title" content="Orion Labs">
<meta name="twitter:title" content="Orion Labs">
<meta property="og:description" content="Orion Labs - Professional Business Management Platform">
<meta name="twitter:description" content="Orion Labs - Professional Business Management Platform">
```

### vite.config.ts
```typescript
manifest: {
  name: "Orion Labs",
  short_name: "Orion Labs", 
  description: "Orion Labs Business Management",
  theme_color: "#1a2a4a",
  ...
}
```

### src/index.css
```css
:root {
  --primary: 220 40% 20%;  /* Navy blue to match Orion Labs logo */
  ...
}
```

---

## What Stays Unchanged

- **Database data**: All `company_profiles` records (including "Leekay Group of Companies") remain in the database
- **User business data**: Quotes, invoices, clients tied to specific users stay as-is
- **Business-specific settings**: Each user's company name, logo, address in Settings remain their own

---

## Summary

| Category | Count |
|----------|-------|
| New logo asset | 1 file |
| Component updates | 4 files |
| Page updates | 2 files |
| Config files | 2 files |
| CSS updates | 1 file |
| **Total** | **10 files** |

The SaaS platform will be fully rebranded to "Orion Labs" with a navy blue theme, while individual business data stored in the database remains untouched.
