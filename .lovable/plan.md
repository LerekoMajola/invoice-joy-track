

# Update Payment Methods

## Change
Update the payment methods list in `RecordPaymentDialog.tsx` and `ReceiptPreview.tsx` to match the actual methods used:

### File: `src/components/invoices/RecordPaymentDialog.tsx`
Replace the `paymentMethods` array:
```ts
// Current
{ value: 'cash', label: 'Cash' },
{ value: 'bank_transfer', label: 'Bank Transfer' },
{ value: 'mobile_money', label: 'Mobile Money' },
{ value: 'cheque', label: 'Cheque' },

// New
{ value: 'cash', label: 'Cash' },
{ value: 'eft', label: 'EFT' },
{ value: 'card_swipe', label: 'Card Swipe' },
{ value: 'mpesa', label: 'M-Pesa' },
{ value: 'ecocash', label: 'EcoCash' },
```

### File: `src/components/invoices/ReceiptPreview.tsx`
Update the `paymentMethodLabels` map to match:
```ts
// New
cash: 'Cash',
eft: 'EFT',
card_swipe: 'Card Swipe',
mpesa: 'M-Pesa',
ecocash: 'EcoCash',
```

### Files changed
- `src/components/invoices/RecordPaymentDialog.tsx`
- `src/components/invoices/ReceiptPreview.tsx`

