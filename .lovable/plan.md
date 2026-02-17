

# Upload Document to Auto-Fill Quote

Instead of typing everything manually, you'll be able to upload a PDF or Word document and have the system automatically extract the information and fill in the quote form fields.

## How it will work

1. A new "Upload Document" button appears at the top of the quote creation form
2. You select a PDF or Word file from your device
3. The system reads the document, sends the text to AI, and extracts: client name, description, line items (with quantities and prices), lead time, and notes
4. The form fields are automatically populated with the extracted data
5. You review, adjust if needed, and save

## Technical approach

### 1. New edge function: `extract-quote-from-document`
- Receives the uploaded file's text content
- Uses Lovable AI (Gemini) to intelligently parse the text and extract structured quote data
- Returns: client name, description, lead time, notes, and line items (description, quantity, unit price, cost price)
- Uses tool calling to ensure structured JSON output

### 2. Client-side PDF/Word text extraction
- For PDFs: use the already-installed `pdfjs-dist` library to extract text from all pages
- For Word (.docx) files: add `mammoth` library to convert .docx to plain text
- Text extraction happens in the browser before sending to the backend -- no file upload to storage needed

### 3. Update the quote creation dialog (`src/pages/Quotes.tsx`)
- Add an "Upload Document" button with a file input (accepts .pdf, .docx)
- On file select: extract text client-side, call the edge function, populate the form fields
- Show a loading spinner during processing
- Show a toast confirming "Document parsed -- please review the extracted data"
- Match extracted client name against existing clients to auto-select the right one

## Files to create/modify

| File | Action |
|------|--------|
| `supabase/functions/extract-quote-from-document/index.ts` | Create -- AI-powered text-to-quote extraction |
| `src/pages/Quotes.tsx` | Update -- add upload button, text extraction, form population |
| `supabase/config.toml` | Update -- register new edge function |

## What gets extracted

The AI will look for and extract:
- **Client/company name** -- matched against your existing client list
- **Description** -- project or work description
- **Line items** -- each with description, quantity, unit price, and cost price (if available)
- **Lead time** -- delivery or turnaround time if mentioned
- **Notes** -- any additional notes or special conditions

If the AI cannot find a particular field, it simply leaves it blank for you to fill in manually.
