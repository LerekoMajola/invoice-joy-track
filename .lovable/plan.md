

## Better Color-Coded Payment Cards + View Proof of Payment

### 1. Stronger Color Coding

- **Unpaid cards**: Red-tinted border, red background wash, red avatar circle, and red amount text -- making it immediately obvious who hasn't paid.
- **Paid cards**: Green-tinted border, green background wash, green avatar circle, and green "Paid" indicator -- a satisfying visual confirmation.
- Section headers will also use matching green/red colors with bolder styling.

### 2. View Proof of Payment (POP) on Click

When a paid member card is clicked, a dialog will open showing:
- Member name and plan details
- Payment amount and period
- The uploaded Proof of Payment image (if available)
- A "No receipt attached" message if no POP was uploaded

This uses the existing `pop_url` field on `gym_member_subscriptions` that members upload via the portal.

### 3. Technical Changes

**File: `src/hooks/useGymMemberSubscriptions.tsx`**
- Add `popUrl` to the `GymMemberSubscription` interface
- Map `s.pop_url` in the fetch function so it's available to consuming components

**File: `src/pages/GymPayments.tsx`**
- Update unpaid card styling: use explicit red/green colors (`bg-red-50`, `border-red-200`, `text-red-600` / `bg-green-50`, `border-green-200`, `text-green-600`) with dark mode equivalents
- Update paid card styling: green tints throughout
- Make paid cards clickable (`cursor-pointer`, `onClick`)
- Add a Dialog that shows the selected subscription's POP image
- Add state for `selectedSub` and `popDialogOpen`
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` from UI components
- Import `ImageIcon` from lucide-react for the empty state
