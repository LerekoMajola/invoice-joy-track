

# Add Trust Signals to the Auth Page

Enhance the login/signup page with visual trust indicators that reassure users their data is safe -- without requiring any backend changes.

---

## What Changes

### 1. Security trust badges below the form

Add a row of small trust indicators beneath the sign-in/sign-up button showing:

- **Shield icon** -- "256-bit SSL Encrypted"
- **Lock icon** -- "Secure Authentication"  
- **Eye-off icon** -- "We never share your data"

These appear as subtle, muted-text items with icons, giving users confidence without cluttering the form.

### 2. Left-side branding panel improvements (desktop)

Replace the generic "Manage Your Business Operations" text area with trust-building content:

- Add a short **testimonial quote** from a satisfied user (placeholder text that can be updated later)
- Add a "Trusted by **50+** businesses" line with a small stat
- Keep the existing feature pills (Quotes, Invoices, CRM, Tasks)

### 3. Footer-level trust line on the form

Add a small line at the very bottom of the form area:

> "Your data is protected with enterprise-grade security"

This is a subtle, muted text line that appears below the "Don't have an account?" toggle.

### 4. Remove hardcoded "Orion Labs" references

The signup subtitle currently says "Get started with Orion Labs today" -- this should be made generic (e.g., "Get started today") since the platform name is now dynamic via the admin logo settings.

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Auth.tsx` | Add trust badges below form button, add footer trust line, add testimonial to left panel, remove hardcoded "Orion Labs" text |

---

## Technical Details

### Trust badges section (below the submit button)

```text
A flex row with 3 items, each containing:
- A lucide-react icon (Shield, Lock, EyeOff) at 14px
- A small muted text label
- Styled with text-xs text-muted-foreground, spaced evenly
- Separated by subtle dot dividers
```

### Left panel testimonial (desktop only)

```text
Below the existing description text, add:
- A blockquote with italic text: a short user testimonial
- Author name and title in smaller text
- A "Trusted by 50+ businesses" badge-style element
- All white/semi-transparent text to match the existing gradient panel
```

### Hardcoded text fix

```text
Line 159: "Get started with Orion Labs today"
Changes to: "Get started with your free account"
```

### Icons used

All from `lucide-react` (already installed): `Shield`, `EyeOff` (added to imports alongside existing `Mail`, `Lock`, `Loader2`)

