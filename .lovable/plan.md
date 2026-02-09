

# Fix Link Preview (Open Graph) Logo

## Problem
When sharing the website URL (e.g. on WhatsApp), the link preview card shows the old "LEE" (Leekay) logo instead of the Orion Labs logo. This happens because:
- The `index.html` file is missing an `og:image` meta tag, so platforms pick up whatever image they find
- The old `leekay-logo.png` file still exists in the project
- The PWA icon files (`pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon.png`, `favicon.ico`) may still contain old branding

## What Will Be Fixed

### 1. Add Open Graph Image
Add the `og:image` and `twitter:image` meta tags to `index.html` pointing to the Orion Labs logo. This is what messaging apps and social media platforms use to generate the preview card.

### 2. Remove Old Leekay Logo
Delete `src/assets/leekay-logo.png` from the project since it is no longer used. The platform already uses `orion-labs-logo.png` as the default fallback.

### 3. Copy Orion Labs Logo to Public Folder
Place the Orion Labs logo in the `public/` folder as `og-image.png` so it can be referenced by the Open Graph meta tag with a full URL (OG images require absolute URLs).

## Technical Details

### Files to Modify
| File | Change |
|------|--------|
| `index.html` | Add `og:image` and `twitter:image` meta tags pointing to `/og-image.png` |

### Files to Create
| File | Purpose |
|------|---------|
| `public/og-image.png` | Copy of the Orion Labs logo for Open Graph previews |

### Files to Delete
| File | Reason |
|------|--------|
| `src/assets/leekay-logo.png` | Old branding no longer used anywhere |

### Important Note
After publishing, platforms like WhatsApp cache link previews. It may take some time for the new image to appear. You can force a refresh on some platforms by using tools like the Facebook Sharing Debugger or simply waiting for the cache to expire.

