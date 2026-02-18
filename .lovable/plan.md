

## Fix: Payment Required Page Banking Details

### The Problem
The banking details on the Payment Required page don't match the actual details used on the admin invoices. The invoice uses the correct details, but the payment page has placeholder/wrong values.

### What's Wrong (Payment Required page vs Invoice)

| Field | Payment Page (wrong) | Invoice (correct) |
|-------|---------------------|-------------------|
| Bank | FNB Lesotho | First National Bank (FNB) |
| Account Name | Orion Labs (Pty) Ltd | Orion Labs (Pty) Ltd |
| Account Number | 62012345678 | 63027317585 |
| Branch Code | 260001 | Pioneer Mall |

### The Fix

**File: `src/pages/PaymentRequired.tsx`**

Update the Bank Transfer tab (lines 215-234) to use the correct banking details from the invoice:

- Bank: "First National Bank (FNB)"
- Account Name: "Orion Labs (Pty) Ltd" (already correct)
- Account No: "63027317585"
- Branch: "Pioneer Mall"
- Reference: (already correct -- uses `paymentReference`)

