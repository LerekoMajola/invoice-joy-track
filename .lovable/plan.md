

# Fix Platform Logo Upload and Add Size Guidance

## Problem

The logo upload fails with a "row-level security policy" error because the storage policies on `company-assets` require the first folder in the path to match the logged-in user's ID (e.g., `user-uuid/logo.png`). The admin upload uses the path `platform/logo.png`, which does not match any user ID and gets blocked.

## Solution

### 1. Add storage policies for the `platform/` prefix

Create new RLS policies on the `storage.objects` table that allow super admins to INSERT, UPDATE, DELETE, and SELECT files where the path starts with `platform/`.

The policies will use the existing `has_role()` function to verify the user is a `super_admin`.

**New policies:**

| Policy | Command | Condition |
|--------|---------|-----------|
| Super admins can upload platform assets | INSERT | bucket = `company-assets`, folder starts with `platform`, user has `super_admin` role |
| Super admins can update platform assets | UPDATE | Same as above |
| Super admins can delete platform assets | DELETE | Same as above |
| Anyone can view platform assets | SELECT | bucket = `company-assets`, folder starts with `platform` |

The SELECT policy is public because the logo needs to be visible on unauthenticated pages (landing, login, etc.). The bucket is already public, but the RLS SELECT policy is also needed.

### 2. Add recommended size guidance to the upload UI

Update the `AdminSettingsTab` component to show clear size recommendations:

- **Recommended dimensions:** 200 x 60 pixels (or similar aspect ratio)
- **Format:** PNG or SVG
- **Max file size:** 2 MB

This information will be displayed near the upload button so admins know the ideal specifications before uploading.

## Files Changed

| File | Change |
|------|--------|
| Database migration (SQL) | Add 4 new storage RLS policies for `platform/` prefix |
| `src/components/admin/AdminSettingsTab.tsx` | Update recommendation text to include preferred dimensions |

