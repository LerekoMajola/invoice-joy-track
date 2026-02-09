

# Convert Case Detail from Popup to Full Page

## What Changes

Currently, clicking a case opens a small dialog popup. This will be converted to a **dedicated full page** at `/legal-cases/:id` that gives you the full screen to work with case details, time entries, expenses, documents, and notes.

## How It Works

- Clicking a case in the list navigates to `/legal-cases/CASE_ID` instead of opening a popup
- The full page uses the same `DashboardLayout` with a header showing the case number, status badge, Edit/Delete buttons, and a Back button
- All 5 tabs (Overview, Time, Expenses, Docs, Notes) remain the same but now have full-page width to breathe
- After deleting a case, you're navigated back to `/legal-cases`
- The "New Case" dialog remains a popup (it's small enough)

## Files Summary

| File | Action |
|------|--------|
| `src/pages/CaseDetail.tsx` | **New** -- full-page version of the case detail view, reusing all the same logic from `CaseDetailDialog` |
| `src/App.tsx` | Add route `/legal-cases/:id` pointing to the new page |
| `src/pages/LegalCases.tsx` | Change `openDetail` to navigate to `/legal-cases/${c.id}` instead of opening a dialog; remove `CaseDetailDialog` usage |
| `src/components/legal/CaseDetailDialog.tsx` | Can be kept for now (no deletion) but will no longer be used from the cases list |

## Technical Details

### New Route

```
/legal-cases/:id
```

The page reads the `id` param, fetches the case from the existing `useLegalCases` hook, and renders the full detail view.

### Page Layout

- Wrapped in `DashboardLayout`
- `Header` component with the case number as title, case title as subtitle, and a "Back to Cases" button
- Status badge + Edit/Delete buttons in the header area
- Full-width `Tabs` component below with all 5 tabs
- Overview tab uses a wider grid layout since there's more horizontal space

### Navigation Changes in LegalCases.tsx

- Remove `selectedCase`, `detailOpen` state and `CaseDetailDialog` import
- Change `openDetail` to: `const openDetail = (c: LegalCase) => navigate(\`/legal-cases/${c.id}\`)`
- Add `useNavigate` import from react-router-dom
