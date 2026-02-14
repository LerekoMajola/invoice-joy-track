

# Redesign: Payment Required Screen

## Overview
Redesign the payment-required page to be more visually appealing, persuasive, and user-friendly. The current page works but feels plain. The new design will feel premium and motivate users to complete payment quickly.

## Design Changes

### 1. Hero Section with Gradient Background
- Replace the plain white background with a subtle gradient (matching the brand)
- Add a lock/shield icon instead of the warning triangle -- less alarming, more professional
- Include a brief reminder of what they're missing: "Your data is safe and waiting for you"

### 2. Active Modules Summary
- Show which modules the user had active during their trial as small badges/chips
- This reminds them of the value they were getting and creates urgency to re-activate

### 3. Improved Amount Card
- Add a subtle gradient border to the amount card
- Show a breakdown: number of active modules and per-module pricing hint
- Add "per month" more prominently

### 4. Streamlined Payment Methods
- Use tabs (M-Pesa | Bank Transfer) instead of collapsible sections to make both options equally visible
- Cleaner step-by-step layout with better spacing
- Add a "Copy" button next to each key detail (reference, amount, account number)

### 5. Trust & Urgency Elements
- Add a small "Your data is preserved" reassurance message
- Add a "Need help?" link with a WhatsApp or email contact option
- Show "Activate instantly after payment confirmation" messaging

### 6. Better Post-Payment State
- After clicking "I've Made Payment", show a more prominent confirmation with estimated activation time
- Add a "Check activation status" button that refreshes the subscription check

## Technical Details

### File Modified
- `src/pages/PaymentRequired.tsx` -- Complete redesign of the component

### What stays the same
- All existing logic: payment notification to admin, reference generation, redirect logic
- The M-Pesa and bank transfer payment details
- Sign out button at the bottom

### New UI Elements
- Tabs component for payment methods (using existing Radix Tabs)
- Module badges showing active modules (from `useModules` hook, already imported)
- Copy buttons for account number and reference
- "Check status" button that invalidates the subscription query to re-check
- Contact/help link at the bottom
- Subtle animations for the amount card (CSS only)

### No new dependencies needed
All UI components (Tabs, Badge, Button, Card) already exist in the project.
