
# Add Document Uploads to Clients and Case Details

## Two Problems Being Solved

1. **Client Documents**: There's no way to attach documents (contracts, ID copies, etc.) to a client. You want to upload and view files when editing a client card.
2. **Case Documents**: The "Docs" tab inside a case detail currently shows a placeholder message. You should be able to upload and view case documents directly from within a case, not just from the separate Legal Documents page.

## What Will Change

### 1. Client Documents (New Feature)

A new database table `client_documents` will store document references for each client. When you open the Edit Client dialog (on the Clients page), a new "Documents" section will appear below the form fields where you can:
- Upload files (PDFs, images, Word docs, etc.)
- See a list of uploaded documents with file name and date
- Download or delete documents
- Files are stored in the existing `company-assets` storage bucket under a `client-docs/` folder

### 2. Case Documents (Enhancement)

The "Docs" tab in the Case Detail dialog will be upgraded from a placeholder to a fully functional interface showing:
- All documents from Legal Documents that are linked to this case
- An "Upload" button to add a new document directly from the case (saves to the `legal-documents` bucket and `legal_documents` table with the case ID pre-filled)
- Download and view buttons for each document

## Database Changes

### New Table: `client_documents`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| user_id | uuid | For RLS |
| client_id | uuid | Links to clients table |
| title | text | Document name/label |
| file_name | text | Original file name |
| file_size | integer | In bytes |
| file_url | text | Public URL from storage |
| created_at | timestamptz | Auto |

Standard RLS policies: users can only access their own documents.

No new tables needed for case documents -- they already use the `legal_documents` table.

## Files Summary

| File | Action |
|------|--------|
| New migration | Create `client_documents` table with RLS |
| `src/hooks/useClientDocuments.tsx` | New hook: fetch, upload, delete client documents |
| `src/pages/Clients.tsx` | Add documents section to the Edit Client dialog with upload/list/delete |
| `src/components/legal/CaseDetailDialog.tsx` | Replace the placeholder "Docs" tab with actual document list, upload button, and download links |

## Technical Details

### Client Documents Upload Flow
- User opens Edit Client dialog and scrolls to the Documents section
- Clicks "Upload" and selects a file
- File is uploaded to `company-assets` bucket at path `client-docs/{user_id}/{timestamp}.{ext}`
- A row is inserted into `client_documents` with the public URL
- The document appears in the list immediately

### Case Documents in Case Detail
- The "Docs" tab queries `legal_documents` table filtered by `case_id`
- "Upload" button opens an inline form (title + file picker) and uploads to `legal-documents` bucket
- Inserts a row into `legal_documents` with the `case_id` pre-set
- Existing documents show title, file name, size, and a download button
