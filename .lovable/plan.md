

## Fix Package Selector Page Contrast and Logo

### Issues
- Logo is not clickable (needs to navigate to landing page)
- Text on the gradient background is dark and hard to read -- headings, subtitle, prices, feature text, and links all need white/light treatment
- The "custom package" link at the bottom is barely visible

### Changes

**File: `src/components/auth/PackageTierSelector.tsx`**

1. **Make logo clickable**: Wrap `PlatformLogo` in a `Link to="/"` so clicking it returns to landing
2. **White text for heading area**: Change the system label (e.g. "BizPro") and subtitle text from dark foreground/muted to white/white-70 so they pop on the gradient
3. **White "custom package" link**: Change from `text-primary` to `text-white` with white underline
4. **Cards stay as-is**: The white cards with dark text already have good contrast -- no changes needed there

Only one file changes: `src/components/auth/PackageTierSelector.tsx`.
