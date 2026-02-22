

## Fix Logo Styling and Text Contrast Across the System

### Problem
1. Several `PlatformLogo` instances lack the white padding/rounded styling (showing as raw images)
2. Text on gradient backgrounds uses dark `text-foreground` / `text-muted-foreground` instead of white, causing poor contrast
3. Some logos are not clickable
4. The AuthBrandingPanel logo still uses `rounded-full` instead of `rounded-2xl`

### Changes

**1. `src/components/shared/PlatformLogo.tsx` -- Enforce white padding in defaults**

- Change the default className to always include `rounded-xl p-1 bg-white shadow-sm object-contain`
- Update the circular-padding detection logic to check for `rounded-2xl` as well (since we no longer use `rounded-full`)

**2. `src/components/auth/AuthBrandingPanel.tsx` -- Fix logo shape**

- Change `rounded-full` to `rounded-2xl` on the logo (line 34)

**3. `src/components/auth/SystemSelector.tsx` -- Fix contrast + make logo clickable**

- Wrap `PlatformLogo` in `<Link to="/">`
- Change heading from `text-foreground` to `text-white`
- Change subtitle from `text-muted-foreground` to `text-white/70`

**4. `src/components/auth/ModuleSelector.tsx` -- Fix contrast + logo styling + clickable**

- Add white padding classes to the `PlatformLogo`
- Wrap in `<Link to="/">`
- Change heading from `text-foreground` to `text-white`
- Change subtitle from `text-muted-foreground` to `text-white/70`

**5. `src/pages/Auth.tsx` -- Fix review step logo + contrast**

- Line 311: Add white padding classes to `PlatformLogo` and wrap in `<Link to="/">`
- Line 313: Change `text-foreground` to `text-white`
- Line 316: Change `text-muted-foreground` to `text-white/70`

### Summary Table

| File | Logo Fix | Contrast Fix | Clickable |
|------|----------|-------------|-----------|
| PlatformLogo.tsx | Default includes white padding | N/A | N/A |
| AuthBrandingPanel.tsx | rounded-full to rounded-2xl | Already white | Already linked |
| SystemSelector.tsx | Already has padding | heading + subtitle to white | Add Link |
| ModuleSelector.tsx | Add padding classes | heading + subtitle to white | Add Link |
| Auth.tsx (review step) | Add padding classes | heading + subtitle to white | Add Link |

### Technical Details

- All logos get `rounded-xl p-2 bg-white shadow-sm` (or `rounded-2xl` for larger sizes)
- All text on `bg-gradient-hero` backgrounds uses `text-white` for headings and `text-white/70` for subtitles
- All logos wrapped in `<Link to="/">` for navigation back to landing page
- 5 files modified total

