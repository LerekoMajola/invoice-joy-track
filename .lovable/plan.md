

# Rename Systems to "Pro Series" Branding

All seven system types will be renamed with the "Pro" suffix branding. The internal database values (`business`, `workshop`, etc.) remain unchanged -- only the display labels shown to users will be updated.

## New Names

| Current Name | New Name |
|---|---|
| Business | BizPro |
| Workshop | ShopPro |
| School | EduPro |
| Legal | LawPro |
| Tool Hire | HirePro |
| Guest House | StayPro |
| Fleet | FleetPro |

## Files to Update

### Landing Page
1. **`src/components/landing/Hero.tsx`** -- Update industry labels array and hero description text
2. **`src/components/landing/Solutions.tsx`** -- Update `name` fields in the industries array
3. **`src/components/landing/Footer.tsx`** -- Update Solutions link text

### Auth Flow
4. **`src/components/auth/SystemSelector.tsx`** -- Update `label` fields in the systems array
5. **`src/components/auth/AuthBrandingPanel.tsx`** -- Update marketing description text
6. **`src/components/auth/PackageTierSelector.tsx`** -- Update `SYSTEM_CONFIG` labels
7. **`src/pages/Auth.tsx`** -- Update `SYSTEM_META` labels

### Dashboard & Navigation
8. **`src/components/layout/Sidebar.tsx`** -- No changes needed (uses module names like "Workshop", "Fleet", not system labels)
9. **`src/pages/Fleet.tsx`** -- Update page title to "FleetPro"

### Admin
10. **`src/components/admin/ModuleManagement.tsx`** -- Update any system label references
11. **`src/components/admin/TenantModuleManager.tsx`** -- Update system label references

### Backend
12. **`supabase/functions/export-data-backup/index.ts`** -- Update `SYSTEM_LABELS` record

### Config
13. **`vite.config.ts`** -- Update PWA description if needed

### Settings
14. **`src/pages/Settings.tsx`** -- Update profile/company label mappings (e.g., "Workshop Profile" becomes "ShopPro Profile")

## Technical Notes
- Internal `system` type values in the database (`business`, `workshop`, `school`, `legal`, `hire`, `guesthouse`, `fleet`) will NOT change -- these are used in database constraints, URL params, and routing logic
- Only user-facing display strings are renamed
- All descriptions will be updated to reference the new Pro names where appropriate
