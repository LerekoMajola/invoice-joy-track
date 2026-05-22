## Goal

Make auto-save feel real and reliable while drafting long quotes (and invoices):
1. Show a live **"Saving… / Saved HH:MM"** badge inside the quote and invoice dialogs.
2. Periodically persist the in-progress document to the **database as a `draft`** (every ~20s, only if there are meaningful changes), so work survives browser crashes, device switches, and session expiry — not just localStorage.

Keep the existing 1s-debounced localStorage backup as the fast layer; the DB draft is the durable layer.

## What changes

### 1. Shared auto-save status hook
New `src/hooks/useAutoSaveStatus.ts` — small state machine returning `{ status: 'idle' | 'saving' | 'saved' | 'error', lastSavedAt: Date | null }` plus a `markSaving()` / `markSaved()` / `markError()` API. Used by both the indicator UI and the save logic.

### 2. Extend `useAutoSaveDraft`
Add an optional second persistence callback so the same hook can drive both localStorage (already there) and a remote save:
- New option `onRemoteSave?: (data: T) => Promise<void>` and `remoteIntervalMs` (default 20000).
- Skip the remote save when data is "empty" (no client + no line item with description/price) to avoid creating junk drafts.
- Only call `onRemoteSave` when the serialized payload changed since the last successful remote save (hash compare).
- Report progress via a callback so the UI can show Saving/Saved.

### 3. Quote dialog (`src/pages/Quotes.tsx`)
- Track `currentDraftId: string | null` in state. Set it when `editingQuote` is opened or after the first remote auto-save.
- Provide `onRemoteSave` that:
  - If `currentDraftId` exists → calls `updateQuote(currentDraftId, { ...draftData, status: 'draft' })`.
  - Otherwise → calls `createQuote({ ...draftData, status: 'draft' })`, stores the returned id, and silently swaps the dialog into "edit existing draft" mode (so a second tick updates, not duplicates).
  - Suppress the existing `toast.success('Quote created/updated')` for autosave-originated calls (add an `opts.silent` flag to `createQuote`/`updateQuote` in `useQuotes`).
- Add a small `AutoSaveIndicator` in the `DialogHeader` row: spinner + "Saving…" while in flight, check icon + "Saved 14:32" otherwise, red dot + "Save failed — will retry" on error.
- On successful manual Save / Send, `clearDraft()` and reset `currentDraftId` as today.

### 4. Invoice dialog (`src/components/invoices/InvoicePreview.tsx` + `src/pages/Invoices.tsx`)
- Mirror the quote behavior: the inline invoice editor already uses `useAutoSaveDraft`. Wire the same `onRemoteSave` against `useInvoices` (`createInvoice` / `updateInvoice` with `status: 'draft'`), track `currentDraftId`, and render the same `AutoSaveIndicator` in the editor header.
- Add a `silent` option to `createInvoice` / `updateInvoice` to suppress toasts for autosave ticks.

### 5. Reusable indicator
New `src/components/shared/AutoSaveIndicator.tsx` — accepts `{ status, lastSavedAt }` and renders the badge using existing semantic tokens (`text-muted-foreground`, `text-success`, `text-destructive`), with a tiny `Loader2` spinner for the saving state.

## Behavior summary

- Typing pauses ≥ 1s → localStorage write (instant safety net).
- Typing pauses ≥ 20s OR every 20s of continued editing → DB draft upsert (durable).
- Header always shows the latest state: **Saving…** during the request, then **Saved HH:MM** afterward.
- The draft shows up in `/drafts` immediately, because it lands in the `quotes` / `invoices` table with `status='draft'`.
- Manual **Save as draft** / **Send** / **Save** still work exactly as today and clear the localStorage backup on success.

## Out of scope

- No schema changes (the existing `quotes` / `invoices` `status='draft'` rows are reused).
- No changes to numbering (drafts already consume a number via `reserve_document_number`; this matches the current "Save as draft" behavior).
- Recurring documents, delivery notes, and other forms are not touched in this pass.
