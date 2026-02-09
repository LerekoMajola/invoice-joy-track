

# Make Phone Number Prominent in Add Client Dialog

## The Problem
When adding a new client from the Job Card creation flow, the phone field is buried and easy to skip. But the phone number is essential for WhatsApp job update alerts.

## Changes

### File: `src/components/crm/AddClientDialog.tsx`

Reorder the form fields and add a WhatsApp hint to make the phone number prominent:

1. **Move Phone up** -- place it right after Organisation Name and Contact Person, before Email
2. **Add WhatsApp hint** -- show a small green helper text below the phone field: "Used for WhatsApp job updates" with a message icon
3. **Reorder layout**:
   - Row 1: Organisation Name (full width, required)
   - Row 2: Contact Person + Phone (for WhatsApp)
   - Row 3: Email + Source
   - Row 4: Address
   - Row 5: Status

The phone label changes to **"Phone (WhatsApp)"** and gets a small green hint underneath so users understand why it matters.

No database or backend changes needed -- the phone column already exists in the clients table.
