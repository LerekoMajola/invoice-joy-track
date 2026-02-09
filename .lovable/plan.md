

# Add Standalone "Create Delivery Note" Dialog

## Problem

Currently, delivery notes can only be created from an invoice -- the "New Delivery Note" button on the Delivery Notes page does nothing. You need the ability to create a delivery note directly, without needing a quote or invoice first.

## Solution

Create a new "Add Delivery Note" dialog that opens when you click the "New Delivery Note" button. It will let you fill in a client name, date, delivery address, and add line items manually -- no invoice or quote required.

## What the Dialog Will Include

- **Client Name** (required text field)
- **Date** (date picker, defaults to today)
- **Delivery Address** (optional textarea)
- **Line Items** section with:
  - Description and Quantity for each item
  - "Add Item" button to add more rows
  - Remove button on each item
- **Optional**: A dropdown to link an existing client from your client list (auto-fills name and address)
- Submit button to create the delivery note

## Changes

### 1. New File: `src/components/delivery-notes/AddDeliveryNoteDialog.tsx`

A dialog component following the same pattern as AddClientDialog:
- Form with client name, date, delivery address, and items list
- Optional client selector dropdown that pre-fills client name and address from existing clients
- Dynamic item rows (add/remove)
- Calls `createDeliveryNote` from the existing hook on submit
- Resets form on close

### 2. Update: `src/pages/DeliveryNotes.tsx`

- Import the new `AddDeliveryNoteDialog`
- Add state for dialog open/close (`showCreateDialog`)
- Wire the "New Delivery Note" button to open the dialog (currently `onClick: () => {}`)
- Pass `createDeliveryNote` or let the dialog use the hook directly

## Technical Details

- The `useDeliveryNotes` hook already supports creating notes with optional `clientId` and `invoiceId` -- both can be `null`
- The `DeliveryNoteInsert` interface already accepts optional `clientId` and `invoiceId`
- The database `delivery_notes` table has `client_id` and `invoice_id` as nullable columns
- No database changes needed -- the schema already supports standalone delivery notes
- The dialog will use `useClients` to offer an optional client dropdown for convenience

