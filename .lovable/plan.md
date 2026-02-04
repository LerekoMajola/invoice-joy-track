

# Show Tenant Business Logo in Sidebar

## Overview
Update the Sidebar to display the logged-in user's business logo from their `company_profiles.logo_url` instead of the Orion Labs platform logo. This creates a proper multi-tenant experience where users see their own branding when working in the app.

---

## Current vs. Desired Behavior

| Location | Current | Desired |
|----------|---------|---------|
| Landing page, Auth | Orion Labs logo | Orion Labs logo (no change) |
| Sidebar (logged in) | Orion Labs logo | Tenant's business logo from `company_profiles.logo_url` |

---

## Implementation

### File: `src/components/layout/Sidebar.tsx`

**Changes:**
1. Import and use the `useCompanyProfile` hook to get the tenant's logo
2. Display `profile.logo_url` if available, otherwise fall back to company name or a placeholder
3. Keep Orion Labs logo as a small "Powered by" badge or remove it entirely from the sidebar

```text
+ import { useCompanyProfile } from '@/hooks/useCompanyProfile';
+ import { Building2 } from 'lucide-react';

  export function Sidebar({ onNavigate }: SidebarProps) {
    const location = useLocation();
    const { user, signOut } = useAuth();
+   const { profile, isLoading } = useCompanyProfile();

    // In the logo section:
-   <img src={orionLabsLogo} alt="Orion Labs" className="h-7 w-auto" />
+   {profile?.logo_url ? (
+     <img src={profile.logo_url} alt={profile.company_name || 'Company'} className="h-8 w-auto max-w-[160px] object-contain" />
+   ) : (
+     <div className="flex items-center gap-2">
+       <Building2 className="h-5 w-5 text-primary" />
+       <span className="font-semibold text-sm truncate">
+         {profile?.company_name || 'My Business'}
+       </span>
+     </div>
+   )}
```

---

## Behavior Summary

| Scenario | Display |
|----------|---------|
| Tenant has uploaded logo | Their logo image |
| Tenant has company name only | Company name with building icon |
| No profile yet | "My Business" with building icon |
| Loading state | Can show skeleton or maintain current display |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/layout/Sidebar.tsx` | Add useCompanyProfile hook, conditionally render tenant logo |

This ensures that when you're logged in as "Leekay Group of Companies", you see your business logo in the sidebar, creating a personalized experience for each tenant.

