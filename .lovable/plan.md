

# Sync Published Site with Current Preview

## Issue Identified

The **published site** (`invoice-joy-track.lovable.app`) is out of date. The current codebase in the preview already has:

- ✅ Landing page at `/` route
- ✅ Orion Labs logo throughout
- ✅ "Forgot password?" link on Auth page
- ✅ Password reset flow

The screenshot you shared shows the **old published version** which still has:
- Auth page at `/`
- Leekay logo
- No "Forgot password?" link

## Solution

**No code changes needed** - simply publish the current preview to the live site.

## How to Publish

1. Click the **"Publish"** button in the top-right corner of Lovable
2. Wait for deployment to complete
3. Visit `invoice-joy-track.lovable.app` to verify the changes

## After Publishing, Users Will See

| Route | Page |
|-------|------|
| `/` | Landing page with Orion Labs branding |
| `/auth` | Auth page with Orion Labs logo + "Forgot password?" link |
| `/reset-password` | Password reset flow |
| `/dashboard` | Dashboard (protected) |

