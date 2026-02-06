

# Add Logo to Admin Panel Header

Replace the static Shield icon in the Admin panel header with the platform logo (Orion Labs logo), matching the branding used on public pages.

---

## What Changes

The Admin panel header currently shows a generic shield icon with text "Platform Admin / Orion Labs Management Console". This will be updated to display the Orion Labs logo image alongside the text, giving the admin panel a more polished, branded look.

---

## Implementation

### File: `src/pages/Admin.tsx`

1. Import the Orion Labs logo asset (`src/assets/orion-labs-logo.png`) -- the same logo already used on the landing page, auth page, and footer.

2. Replace the Shield icon block in the header with the logo image:
   - Show the Orion Labs logo image (approximately 32px height) in place of the shield icon circle
   - Keep the "Platform Admin" title and "Orion Labs Management Console" subtitle
   - Add a fallback to the Shield icon in case the image fails to load

### Visual Result

```text
Before:  [Shield Icon]  Platform Admin
                         Orion Labs Management Console

After:   [Orion Logo]   Platform Admin
                         Orion Labs Management Console
```

---

## Technical Details

- Single file change: `src/pages/Admin.tsx`
- Import the existing `orion-labs-logo.png` asset (already in `src/assets/`)
- Replace the `<div className="p-2 rounded-lg bg-primary/10"><Shield ... /></div>` with an `<img>` element styled consistently with the header
- Add `onError` fallback to show the Shield icon if the image cannot load
- No new dependencies or database changes needed

