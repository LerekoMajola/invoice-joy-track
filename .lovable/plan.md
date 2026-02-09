

# WhatsApp Client Alert Button on Job Card

## What This Does
Adds a WhatsApp button to the job card detail view that, with one tap, opens WhatsApp with the client's number and a pre-filled message about the job status update. No API keys or third-party services needed — it uses the standard `https://wa.me/` deep link that works on both mobile and desktop.

## How It Works

1. **Fetch client phone number**: When the job card detail opens, look up the client's phone number from the `clients` table using the existing `clientId` on the job card.

2. **WhatsApp button in the sticky footer**: Add a green WhatsApp icon button next to the existing action buttons. One tap opens WhatsApp (or WhatsApp Web on desktop) with:
   - The client's phone number pre-filled
   - A status-appropriate message like: *"Hi [Client Name], update on your vehicle [Reg]: your job (JC-0012) is now In Progress. We'll keep you posted!"*

3. **Status-aware messages**: The pre-filled message automatically changes based on the current job status:
   - **Diagnosing**: "We've started diagnosing your vehicle..."
   - **Diagnosed**: "Diagnosis is complete, we'll send you a quote shortly..."
   - **In Progress**: "Work has started on your vehicle..."
   - **Completed**: "Your vehicle is ready for collection!"
   - etc.

4. **Fallback**: If no phone number is available, the button is disabled with a tooltip saying "No phone number on file."

## Technical Details

### File: `src/components/workshop/JobCardDetailDialog.tsx`

- Add a `clientPhone` state, fetched from the `clients` table using `jobCard.clientId` when the dialog opens
- Add a helper function `getWhatsAppUrl(phone, jobCard)` that:
  - Strips non-numeric characters from the phone number
  - Builds a status-specific message template
  - Returns `https://wa.me/{phone}?text={encodedMessage}`
- Add a green WhatsApp button (using a MessageCircle or custom icon) in the sticky bottom bar
- The button calls `window.open(whatsAppUrl, '_blank')` on click

### File: `src/components/workshop/jobCardFlowUtils.ts`

- Add a `getStatusMessage(status, clientName, vehicleReg, jobCardNumber)` function that returns an appropriate WhatsApp message template for each status

### No database changes needed
The `clients` table already has a `phone` column. The `job_cards` table already has `client_id`.

