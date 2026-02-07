

# Dynamic Platform Logo Management

Allow the super admin to upload a custom platform logo from the Admin panel, which then replaces the hardcoded Orion Labs logo across the entire application -- landing page, auth page, reset password page, footer, and admin header.

---

## How It Will Work

1. A new "Platform Settings" tab appears in the Admin panel
2. The admin can upload a logo image (drag-and-drop or file picker)
3. The uploaded logo is stored in file storage and its URL saved in a new database table
4. All pages that currently show the hardcoded logo will dynamically load the uploaded logo instead
5. The hardcoded Orion Labs logo remains as the default fallback if no custom logo has been uploaded

---

## What Changes

### New database table: `platform_settings`
A simple key-value settings table to store platform-wide configuration, starting with the logo URL. Only super admins can read/write.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| key | text (unique) | Setting name, e.g. `platform_logo_url` |
| value | text | The setting value (logo URL) |
| updated_by | uuid | User who last changed it |
| updated_at | timestamp | Last modification time |

### New hook: `usePlatformSettings`
A shared React hook that fetches platform settings (specifically the logo URL) and caches it. All pages will use this hook instead of the static import.

### New component: `PlatformLogo`
A reusable component that renders the platform logo with proper fallback to the default Orion Labs logo. Replaces all hardcoded `<img src={orionLabsLogo}>` instances.

### New admin tab: "Settings" in the Admin panel
A simple UI with:
- Current logo preview
- Upload button to change the logo
- Remove button to revert to default

### Files modified to use dynamic logo (5 files)
- `src/components/landing/Hero.tsx` -- landing page header
- `src/components/landing/Footer.tsx` -- landing page footer
- `src/pages/Auth.tsx` -- login/signup page (3 logo instances)
- `src/pages/ResetPassword.tsx` -- password reset page (2 logo instances)
- `src/pages/Admin.tsx` -- admin panel header

---

## Technical Details

### Database Migration
- Create `platform_settings` table with RLS policies restricted to super admins for write, and public read (since the logo needs to show on unauthenticated pages like landing and auth)
- RLS: Anyone can SELECT (logo must show on public pages), only super admins can INSERT/UPDATE/DELETE

### Storage
- Use the existing `company-assets` public bucket to store the platform logo under a `platform/` prefix

### Hook: `usePlatformSettings`
```text
- Fetches from platform_settings where key = 'platform_logo_url'
- Uses React Query with a long stale time (logo rarely changes)
- Returns { logoUrl, isLoading }
- Falls back to the static orion-labs-logo.png import
```

### Component: `PlatformLogo`
```text
Props:
  - className: string (for sizing, e.g. "h-8 w-auto")
  - alt?: string (defaults to "Platform Logo")
  - fallbackIcon?: ReactNode (optional icon fallback)

Behavior:
  - Uses usePlatformSettings() to get dynamic URL
  - Shows the dynamic logo if available
  - Falls back to static orion-labs-logo.png
  - Has onError handler for broken images
```

### Admin Settings Tab
```text
- New TabsTrigger "Settings" added to Admin.tsx
- New component: AdminSettingsTab
- Shows current logo with upload/remove controls
- Uses uploadAsset pattern similar to company profile logo upload
- Saves URL to platform_settings table
```

### File changes summary
| File | Change |
|------|--------|
| `src/hooks/usePlatformSettings.tsx` | New -- shared hook for platform settings |
| `src/components/shared/PlatformLogo.tsx` | New -- reusable logo component |
| `src/components/admin/AdminSettingsTab.tsx` | New -- logo upload UI in admin |
| `src/components/admin/index.ts` | Export new AdminSettingsTab |
| `src/pages/Admin.tsx` | Add Settings tab |
| `src/components/landing/Hero.tsx` | Replace static logo with PlatformLogo |
| `src/components/landing/Footer.tsx` | Replace static logo with PlatformLogo |
| `src/pages/Auth.tsx` | Replace 3 static logos with PlatformLogo |
| `src/pages/ResetPassword.tsx` | Replace 2 static logos with PlatformLogo |
| Migration SQL | Create platform_settings table + RLS |
