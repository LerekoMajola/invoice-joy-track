

# Drafts Folder

A new "Drafts" page that collects all your draft quotes and draft invoices in one place, so you can quickly find and resume unfinished work.

## What you'll get

- A new "Drafts" item in the sidebar navigation (with a folder icon), visible to all system types
- A single page at `/drafts` showing two sections:
  - **Draft Quotes** -- all quotes with status "draft", with options to view, edit, or delete
  - **Draft Invoices** -- all invoices with status "draft", with options to view or delete
- Each item shows the document number, client name, date, and amount
- Clicking a draft takes you to the relevant Quotes or Invoices page with the document opened for editing
- Empty state messages when there are no drafts in either category

## Technical details

| File | Action |
|------|--------|
| `src/pages/Drafts.tsx` | Create -- new page showing filtered draft quotes and invoices |
| `src/App.tsx` | Update -- add `/drafts` route |
| `src/components/layout/Sidebar.tsx` | Update -- add "Drafts" nav item between Quotes and Invoices |
| `src/components/layout/BottomNav.tsx` | Update -- add Drafts to mobile nav if applicable |

### New page: `src/pages/Drafts.tsx`
- Uses existing `useQuotes` and `useInvoices` hooks
- Filters each list to only show items where `status === 'draft'`
- Displays a summary card showing total draft count
- Shows mobile card view and desktop table view (matching existing patterns)
- "Edit" on a draft quote navigates to `/quotes` with sessionStorage data to open that quote for editing
- "View" on a draft invoice navigates to `/invoices` with sessionStorage data to open the preview

### Sidebar update
- Add entry: `{ name: 'Drafts', href: '/drafts', icon: FolderOpen, moduleKey: null, systemTypes: null }`
- Position it after Quotes/before Invoices so it sits logically between the two document types

### Route update
- Add `<Route path="/drafts" element={<ProtectedRoute><Drafts /></ProtectedRoute>} />` in `App.tsx`
