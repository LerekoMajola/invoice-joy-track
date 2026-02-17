
# Prevent Quote Data Loss

## What went wrong
Your login session expired during the hour you spent typing. Network drops prevented the auto-refresh from working. When you hit save, the database rejected the insert because it no longer knew who you were -- and the form data was lost because nothing was saved locally.

## Fix 1: Auto-save drafts to local storage

Create a new utility hook that periodically saves the quote form data to the browser's local storage. If the page reloads, the network drops, or a save fails, the data can be restored.

### New file: `src/hooks/useAutoSaveDraft.ts`
- Accept a key (e.g. `quote-draft`) and form data object
- Every 10 seconds (and on every field change), write the current form state to `localStorage`
- On mount, check if a saved draft exists and return it so the form can pre-populate
- Provide a `clearDraft()` function to call after a successful save
- Use `JSON.stringify` / `JSON.parse` with a timestamp so stale drafts (older than 7 days) auto-expire

### Update: `src/pages/Quotes.tsx` (or the quote creation dialog)
- Integrate the `useAutoSaveDraft` hook into the quote creation form
- On mount, if a draft exists, prompt the user: "You have an unsaved quote draft from [date]. Restore it?"
- After a successful `createQuote()`, call `clearDraft()`

## Fix 2: Session check before saving

### Update: `src/hooks/useQuotes.tsx`
- In `createQuote`, before attempting the insert, call `supabase.auth.getSession()` to verify the session is still valid
- If the session is null or expired, attempt `supabase.auth.refreshSession()`
- If refresh also fails, show a clear error: "Your session has expired. Your draft has been saved locally. Please log in again to continue." -- instead of the generic "Failed to create quote"
- This ensures the user knows exactly what happened and that their data is safe

## Fix 3: Retry with feedback on network issues

### Update: `src/hooks/useQuotes.tsx`
- Wrap the insert call in a simple retry (1 retry after 2-second delay) for transient network errors
- If the final attempt fails, show a specific message distinguishing between auth errors and network errors

## Summary of new/changed files

| File | Action |
|------|--------|
| `src/hooks/useAutoSaveDraft.ts` | Create -- generic local-storage auto-save hook |
| `src/pages/Quotes.tsx` (or quote dialog) | Update -- integrate auto-save, add draft restore prompt |
| `src/hooks/useQuotes.tsx` | Update -- session check before insert, retry logic, better error messages |

## Result
- Your quote form data is always backed up locally every 10 seconds
- If your session expires, the system tries to refresh it automatically
- If it truly cannot save, you get a clear message and your draft remains safe in local storage
- You will never lose an hour of work again
