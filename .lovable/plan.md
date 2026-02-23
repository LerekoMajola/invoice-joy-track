

## Redesign Billing Page -- Modern, Cutting-Edge

### Overview

A full redesign of the Billing page (`src/pages/Billing.tsx`) with these changes:

1. **Package switcher** -- Browse available tiers for your system type and request a switch
2. **Remove SMS Credits section** -- Hidden entirely
3. **Remove M-Pesa option** -- Only Bank Transfer remains
4. **Correct bank details** -- Account: 63027317585, Branch Code: 280061
5. **Add POP upload** -- Upload proof of payment image/PDF after paying
6. **Modern redesign** -- Glassmorphism cards, gradient accents, animated elements matching the platform's bold visual identity

---

### Detailed Changes

#### 1. New Storage Bucket (if needed) or Reuse `gym-pop`

A new storage bucket `payment-pop` (public) will be created for uploading proof of payment files. This keeps billing POP separate from gym-specific POP.

**Migration**: Create bucket + storage policy for authenticated uploads.

#### 2. Database: Add `pop_url` Column to `subscriptions`

Add a `pop_url` text column to the `subscriptions` table so uploaded proof of payment can be linked to the subscription record.

```sql
ALTER TABLE public.subscriptions ADD COLUMN pop_url text;
```

#### 3. Redesigned Billing Page (`src/pages/Billing.tsx`)

The page will be restructured into these sections:

**A. Status Hero Card** (kept, enhanced)
- Glassmorphism styling with gradient top bar
- Animated status icon (pulse for trial, glow for active)
- Trial progress bar with smooth animation

**B. Current Package Card with "Switch Package" Button**
- Shows current tier name, price, included modules
- "Switch Package" button opens a modal/sheet displaying all available tiers for the user's system type (fetched via `usePackageTiers`)
- Selecting a new tier sends a notification to admin requesting the switch (no self-service DB change -- admin activates it)
- Shows pending switch request if one was sent

**C. Payment Section** (streamlined)
- Payment reference card with copy button (kept)
- **Bank Transfer only** (no M-Pesa) with correct details:
  - Bank: First National Bank (FNB)
  - Account Name: Orion Labs (Pty) Ltd
  - Account Number: **63027317585**
  - Branch Code: **280061**
  - Reference: user's payment reference
- All fields have copy buttons

**D. Upload Proof of Payment (POP)**
- Drag-and-drop / click-to-upload area
- Accepts images (jpg, png) and PDF
- Uploads to `payment-pop` storage bucket
- Saves URL to `subscriptions.pop_url`
- Shows uploaded POP thumbnail/link if already uploaded
- Upload triggers a notification to admin

**E. "I've Made Payment" Button** (kept, enhanced)
- Gradient button with animation
- Success state with confirmation card

**Removed sections:**
- SMS Credits card -- removed entirely
- M-Pesa payment option -- removed entirely

#### 4. Visual Redesign Elements

- Gradient borders and subtle glassmorphism on cards
- Animated gradient dividers between sections
- Hover effects with scale transforms
- Modern typography with the display font
- Smooth transitions and micro-animations
- Color-coded status indicators (green=active, amber=trial, red=expired)

---

### Files Changed

| File | Change |
|------|--------|
| `src/pages/Billing.tsx` | Full redesign with package switcher, POP upload, bank-only payment, modern UI |
| Migration SQL | Add `pop_url` column to `subscriptions`, create `payment-pop` storage bucket with policies |

### Flow Diagram

When a user wants to switch packages:
1. User clicks "Switch Package" on Billing page
2. Modal shows available tiers for their system type
3. User selects desired tier
4. A notification is sent to admin: "[Company] requests package switch to [Tier Name]"
5. Admin processes the switch manually via the Admin panel
6. User sees "Switch requested" badge until admin acts

When a user uploads POP:
1. User clicks upload area or drags file
2. File uploads to `payment-pop` bucket
3. `pop_url` saved to their subscription record
4. Notification sent to admin with POP link
5. Thumbnail/link shown on the Billing page

