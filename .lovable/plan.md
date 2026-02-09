

# Align Legal Documents to Industry Standard

## Changes

### 1. Case Documents Tab -- Add Document Type Selector
Currently, documents uploaded from within a case are all hardcoded as `case_document`. This will be updated to include a document type dropdown matching the firm-wide library (contract, agreement, court paper, evidence, correspondence, pleading, affidavit, other). A type badge will also display on each document in the list.

### 2. Legal Documents Page -- Add Type and Case Filters
The firm-wide document library currently only has a text search. This will be enhanced with:
- A **document type filter** dropdown to narrow by category
- A **case filter** dropdown (All / Unlinked / specific case) so you can find orphaned documents or filter by matter
- Search will also match against the document type and linked case name

### 3. Legal Documents Page -- Add Delete Capability
The firm-wide library currently has no delete button. A delete action will be added matching the pattern already used in the case-level tab.

## Files

| File | Action |
|------|--------|
| `src/components/legal/CaseDocumentsTab.tsx` | Add document type selector to upload form, show type badge on each document |
| `src/pages/LegalDocuments.tsx` | Add type filter, case filter (including "Unlinked" option), delete button, and enhanced search |

## Technical Details

### CaseDocumentsTab.tsx
- Add `documentType` state defaulting to `'other'`
- Add a `Select` dropdown in the upload form with the same `documentTypes` array used on the library page
- Pass `documentType` instead of hardcoded `'case_document'` in the insert call
- Show a small `Badge` with the document type on each document row
- Reset `documentType` on cancel/submit

### LegalDocuments.tsx
- Add `typeFilter` state (default `'all'`) and `caseFilter` state (default `'all'`)
- Render two `Select` dropdowns below the search bar: one for document type, one for case (with "All", "Unlinked", and each case listed)
- Update the `filtered` array to apply type and case filters in addition to text search
- Include document type and case name in text search matching
- Add a delete button to both mobile cards and desktop table rows, reusing the same storage + DB delete pattern from `CaseDocumentsTab`
