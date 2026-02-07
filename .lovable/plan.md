

# Workshop Management System

A workshop module built around the real-world workflow: the car arrives, you inspect it, THEN you quote.

---

## The Real Workshop Workflow

The key insight is that in a workshop, you rarely know the full scope of work upfront. The job card is where everything starts:

```text
Car Arrives --> Receive (Job Card created)
                  |
            Technician inspects
                  |
            Diagnosis recorded on Job Card
                  |
            Generate Quote FROM Job Card findings
                  |
            Customer approves quote
                  |
            Work begins (parts + labour tracked on Job Card)
                  |
            Work complete
                  |
            Generate Invoice FROM Job Card actuals
                  |
            Customer pays, car collected
```

This means the Job Card is the **source of truth**, and quotes/invoices flow FROM it -- not the other way around.

---

## What Gets Built

### 1. Job Cards -- The Core Document

When a car arrives, the workshop creates a job card with only what they know:
- **Client** (who brought the car)
- **Vehicle details** (registration, make, model, year, VIN, mileage)
- **Reported issue** (what the customer says is wrong -- "makes a grinding noise when braking")
- **Priority** (Low / Medium / High / Urgent)

That's it initially. The rest gets filled in as work progresses.

**Status Flow:**
- **Received** -- car checked in, waiting for inspection
- **Diagnosing** -- technician is inspecting the vehicle
- **Diagnosed** -- findings recorded, ready to quote the customer
- **Quoted** -- quote generated and sent to customer
- **Approved** -- customer approved, work can begin
- **In Progress** -- active repair work underway
- **Awaiting Parts** -- paused, waiting for parts to arrive
- **Quality Check** -- work done, being reviewed before handover
- **Completed** -- all work finished
- **Invoiced** -- invoice generated
- **Collected** -- customer picked up the vehicle

### 2. Diagnosis Section

After inspection, the technician records:
- **Diagnosis notes** (what they found wrong)
- **Recommended work** (what needs to be done)
- This is what feeds into the quote

### 3. Job Card to Quote (new flow)

From a diagnosed job card, the user clicks **"Generate Quote"** which:
- Pre-fills the quote with the client details from the job card
- Uses the diagnosis/recommended work as the quote description
- The user adds line items (parts + labour estimates) in the standard quote form
- Links the quote back to the job card (`source_job_card_id` on the quote)

When the quote is accepted, the job card status automatically moves to "Approved."

### 4. Parts and Labour Tracking

As work progresses, the technician adds actual items used:
- **Parts** -- description, quantity, unit cost (with part number field)
- **Labour** -- description, hours, hourly rate
- Each tagged as "parts" or "labour" for clear breakdown
- These are the ACTUAL costs (which may differ from the quote estimate)

### 5. Job Card to Invoice

When work is complete, the user clicks **"Generate Invoice"** which:
- Creates an invoice from the actual parts + labour on the job card (not the quote estimate)
- Pre-fills all client details
- Links back to the job card
- Uses the same sessionStorage pattern as Quote-to-Invoice

### 6. Workshop Dashboard

The Workshop page shows:
- **Summary cards**: Total Jobs, Diagnosing, In Progress, Awaiting Parts, Completed
- **Searchable/filterable list** of job cards (search by reg, client, job number)
- **Mobile card view** + **desktop table view** (same pattern as Invoices/Quotes)

### 7. Printable Job Card

A formatted document following the company branding template, showing:
- Company header with logo
- Vehicle details section
- Reported issue + diagnosis
- Parts and labour table with separate subtotals
- Customer signature line
- Total with VAT

---

## Technical Details

### Database Tables

**`job_cards`** -- the main table

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid | auth user |
| job_card_number | text | auto: JC-0001 |
| client_id | uuid (nullable) | null |
| client_name | text | required |
| vehicle_reg | text (nullable) | null |
| vehicle_make | text (nullable) | null |
| vehicle_model | text (nullable) | null |
| vehicle_year | text (nullable) | null |
| vehicle_vin | text (nullable) | null |
| vehicle_mileage | text (nullable) | null |
| vehicle_color | text (nullable) | null |
| reported_issue | text (nullable) | null |
| diagnosis | text (nullable) | null |
| recommended_work | text (nullable) | null |
| assigned_technician_id | uuid (nullable) | null |
| assigned_technician_name | text (nullable) | null |
| source_quote_id | uuid (nullable) | null |
| invoice_id | uuid (nullable) | null |
| priority | text | 'medium' |
| status | text | 'received' |
| estimated_completion | date (nullable) | null |
| completed_at | timestamptz (nullable) | null |
| tax_rate | numeric | 15 |
| total | numeric | 0 |
| notes | text (nullable) | null |
| created_at | timestamptz | now() |
| updated_at | timestamptz | now() |

RLS: Standard user_id-based policies (same as quotes/invoices).

**`job_card_line_items`** -- parts and labour

| Column | Type | Default |
|--------|------|---------|
| id | uuid PK | gen_random_uuid() |
| job_card_id | uuid FK | required |
| item_type | text | 'parts' (or 'labour') |
| description | text | required |
| part_number | text (nullable) | null |
| quantity | numeric | 1 |
| unit_price | numeric | 0 |
| created_at | timestamptz | now() |

RLS: Ownership validated through job_cards table (same pattern as invoice_line_items).

**Quote table update:** Add a `source_job_card_id` column to the existing `quotes` table to link quotes back to job cards.

### New Files

| File | Purpose |
|------|---------|
| Migration SQL | Create job_cards, job_card_line_items tables; add source_job_card_id to quotes |
| `src/pages/Workshop.tsx` | Main workshop page with dashboard, list, and creation dialog |
| `src/hooks/useJobCards.tsx` | CRUD hook following useInvoices pattern |
| `src/components/workshop/CreateJobCardDialog.tsx` | Intake form -- vehicle details + reported issue |
| `src/components/workshop/JobCardDetailDialog.tsx` | Full detail view with diagnosis, parts/labour, status management |
| `src/components/workshop/JobCardPreview.tsx` | Printable job card document |

### Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add /workshop route |
| `src/components/layout/Sidebar.tsx` | Add Workshop nav item (moduleKey: 'workshop') |
| `src/components/layout/BottomNav.tsx` | Add /workshop to moreRoutes |
| `src/components/layout/MoreMenuSheet.tsx` | Add Workshop menu item |

### Integration Points

**Job Card to Quote:** From the job card detail view, a "Generate Quote" button passes client info, diagnosis, and recommended work via sessionStorage to the Quotes page -- same proven pattern as Quote-to-Invoice.

**Job Card to Invoice:** A "Generate Invoice" button maps actual parts + labour line items to invoice line items via sessionStorage.

**Staff Integration:** The "Assigned Technician" dropdown pulls from the tenant's staff_members table.

**Module Registration:** A new platform_modules record with key `workshop`, icon `Wrench`, priced at M80/month.

### Patterns Followed

- Same hook structure as useInvoices (useState + useEffect + CRUD)
- Same auto-number generation (JC-0001 pattern)
- Same mobile card + desktop table view
- Same summary stats cards
- Same status badge with dropdown menu
- Same document preview with company branding
- Same sessionStorage pattern for cross-page data flow
- Same module gating via moduleKey in navigation

