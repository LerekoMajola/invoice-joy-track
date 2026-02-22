

## Brand the Auth Login Page

### Changes

**File: `src/pages/Auth.tsx`**

1. **Gradient background on login view**: Change the login form's outer `div` from plain `bg-background` to use the platform's hero gradient (`bg-gradient-hero`) for the right panel, giving it the Electric Indigo / Violet / Cyan feel.

2. **Make the logo clickable**: Wrap the mobile `PlatformLogo` in a `Link` to `"/"` so tapping it navigates back to the landing page. Also wrap the "Back to home" text link's logo (if visible on desktop via AuthBrandingPanel) -- but the main fix is the mobile logo at the top of the login form.

3. **Style the login card**: Add a frosted glass card (`bg-card/80 backdrop-blur border rounded-2xl shadow-xl p-8`) around the form content so it sits cleanly on the gradient background, similar to how the screenshot shows a contained card.

4. **Gradient Sign In button**: Already uses `variant="gradient"` -- no change needed.

5. **Apply same treatment to the signup credentials step** (line 414) for consistency.

### Technical Details

| Area | Current | After |
|------|---------|-------|
| Login background | `bg-background` (plain gray) | `bg-gradient-hero` or subtle gradient overlay |
| Mobile logo | Static `PlatformLogo` | Wrapped in `<Link to="/">` |
| Form container | No card wrapper | Glass card with shadow and rounded corners |
| Desktop logo (AuthBrandingPanel) | Not clickable | Wrap in `<Link to="/">` in AuthBrandingPanel |

Only two files change: `src/pages/Auth.tsx` and `src/components/auth/AuthBrandingPanel.tsx`.

