

# Enhance Admin Invoice with Logo, Banking Details & Professional Fields

## Overview
Update both the invoice preview component and the email template with Orion Labs logo, FNB banking details, company contact info, payment terms ("Due on Receipt"), and a professional footer.

## Changes to Both Files

### Header Enhancement
- Add Orion Labs logo (imported from `src/assets/orion-labs-logo.png` in preview; hosted URL in email)
- Full company details: Pioneer Mall, Maseru, Lesotho
- Email: sales@orionlabslesotho.com

### Line Items Table
- Add item numbering (#) column

### Payment Terms
- Display "Payment Terms: Due on Receipt" below dates

### Banking Details Section (after totals)
A clearly styled block:
```text
Bank: First National Bank (FNB)
Branch: Pioneer Mall
Account Number: 63027317585
Reference: [Invoice Number]
```

### Footer
- "Thank you for your business" message
- Company contact: sales@orionlabslesotho.com

### Email-Specific
- Fix sender to `Orion Labs <updates@updates.orionlabslesotho.com>`
- Add banking details HTML block
- Add thank-you footer

## Technical Details

### Files Modified

| File | Changes |
|------|---------|
| `src/components/admin/AdminInvoicePreview.tsx` | Add logo import, company details, payment terms, # column, banking details section, thank-you footer |
| `supabase/functions/send-admin-invoice/index.ts` | Add logo via hosted URL, company details, payment terms, # column, banking details block, thank-you footer, fix from address |

### Logo in Email
The email will reference the logo from the published app URL (`https://invoice-joy-track.lovable.app/pwa-192x192.png`) with a text fallback if the image fails to load.

