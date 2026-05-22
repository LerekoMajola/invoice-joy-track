# Keep session alive while editing a document

## Problem
The 5-minute inactivity timer in `useInactivityLogout` logs the user out even when they're actively working in a Quote or Invoice dialog. The current listeners (`mousedown`, `keydown`, `scroll`, `touchstart`) can miss real typing activity (IME composition, dropdown autofill, dialogs that stop event propagation), and long pauses while thinking/pasting a price list still trip the timer — losing work mid‑entry.

## Goal
Never end the session while the user has an in‑progress (dirty, unsaved) document open. Keep the 5‑minute idle logout for everything else.

## Approach

### 1. New `EditingActivityContext`
Lightweight React context exposing:
- `registerEditing(id)` / `unregisterEditing(id)` — called by document dialogs while they are open with dirty data.
- `pingActivity()` — called on every keystroke / form change inside those dialogs.
- Internal ref tracks the set of active editors and the last activity timestamp.

### 2. Extend `useInactivityLogout`
- Subscribe to the editing context.
- Add `input` and `change` to the activity event list (capture phase, so dialogs that stop propagation still count).
- When the 5‑minute timer fires:
  - If any editor is registered as dirty OR last editing ping was < 5 min ago → **reschedule** the timer instead of signing out (silent extension).
  - Otherwise → sign out as today.
- On `visibilitychange` resume: same guard before logging out.

### 3. Wire into Quote & Invoice dialogs
In `Quotes.tsx` and `Invoices.tsx` (`InvoicePreview`):
- On dialog open with content → `registerEditing(docKey)`.
- On every field change / line item edit → `pingActivity()` (piggyback on the existing autosave debounce — already triggered by the same edits).
- On Save / Send / Cancel / dialog close → `unregisterEditing(docKey)`.
- Optional: also call `registerEditing` whenever the autosave hook reports `status === 'saving'` so anything else using `useAutoSaveDraft` benefits automatically.

### 4. Safety cap
To avoid an effectively infinite session if a dialog is left open by accident, cap the extension at **8 hours total** since last real input. After that, log out normally.

## Out of scope
- Auth/refresh token logic (Supabase refreshes silently while the tab is active — unaffected).
- Portal‑side timers stay unchanged unless you also want this behavior in `/portal`.
- No DB / RLS / schema changes.

## Files touched
- `src/hooks/useInactivityLogout.tsx` — guard logout against active editing, add `input`/`change` capture listeners.
- `src/contexts/EditingActivityContext.tsx` — new provider + `useEditingActivity` hook.
- `src/contexts/AuthContext.tsx` (or `App.tsx`) — mount the provider above the routes that use the inactivity hook.
- `src/pages/Quotes.tsx` — register/unregister + ping on edits.
- `src/pages/Invoices.tsx` + `src/components/invoices/InvoicePreview.tsx` — same wiring.

## Behavior after change
- Typing or editing a quote/invoice → session stays alive indefinitely (up to the 8h safety cap).
- Dialog closed or document saved → normal 5‑minute idle logout resumes.
- No UI change; purely a stability fix.
