

# Fix Logo Placement on Reset Password Page

Make the logo sit inside a solid white rounded container with generous padding, so it appears centered and comfortable.

## Change

In `src/pages/ResetPassword.tsx` (line 130), update the `PlatformLogo` className:

**From:**
```
h-16 w-auto rounded-xl p-3 bg-white/10
```

**To:**
```
h-12 w-auto rounded-2xl p-5 bg-white shadow-sm
```

This gives the logo:
- A solid white background (not semi-transparent)
- Larger padding (`p-5`) so the logo has breathing room
- Slightly smaller logo (`h-12`) inside the larger white box for better proportion
- Rounded corners (`rounded-2xl`) for a polished look
- A subtle shadow for depth

## File Changed

| File | Change |
|------|--------|
| `src/pages/ResetPassword.tsx` | Update PlatformLogo className on line 130 |

