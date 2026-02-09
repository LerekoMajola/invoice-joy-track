

# Auto-Fill Client When Creating Quote From Job Card

## The Problem
When you click "Create Quote" from a job card, you're taken to the Quotes page and the quote form opens -- but you still see the client dropdown and have to verify/confirm the client, even though that information was already entered on the job card. This is unnecessary friction.

## The Fix

### File: `src/pages/Quotes.tsx`

1. **Track when quote is created from a job card** -- add a state variable (e.g., `fromJobCard`) that gets set to `true` when the form is opened via the job card flow.

2. **Lock the client field** -- when `fromJobCard` is true, show the client name as read-only text instead of the dropdown selector, since the client is already determined by the job card.

3. **Also pre-fill line items from the job card** -- currently only the description is carried over. The job card already has parts and labour costs added via "Quick Add Cost." These should be pre-populated as quote line items so you don't have to re-enter them.

### File: `src/pages/Workshop.tsx`

4. **Pass line items in the session data** -- update `handleGenerateQuote` to include the job card's line items (parts and labour) alongside the client info and description, similar to how `handleGenerateInvoice` already does it.

## Technical Details

### Workshop.tsx changes
Update `handleGenerateQuote` to include line items:
```ts
const handleGenerateQuote = (jc: JobCard) => {
  const quoteData = {
    sourceJobCardId: jc.id,
    clientId: jc.clientId,
    clientName: jc.clientName,
    description: [jc.diagnosis, jc.recommendedWork].filter(Boolean).join('\n\n'),
    lineItems: jc.lineItems.map((item) => ({
      description: `${item.itemType === 'labour' ? '[Labour] ' : ''}${item.description}${item.partNumber ? ` (Part #${item.partNumber})` : ''}`,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      costPrice: item.costPrice || 0,
    })),
  };
  // ... rest stays the same
};
```

### Quotes.tsx changes
- Add `const [fromJobCard, setFromJobCard] = useState(false);`
- In the `newQuoteFromJobCard` useEffect: set `fromJobCard` to `true`, pre-fill line items from the passed data
- In the client selector section: when `fromJobCard` is true, show the client name as plain text (read-only) instead of the dropdown
- Reset `fromJobCard` to `false` when the form closes

### Summary
- **2 files** modified: `src/pages/Workshop.tsx` and `src/pages/Quotes.tsx`
- Client is auto-filled and locked (read-only) when coming from a job card
- Line items (parts and labour) are carried over so you don't re-enter costs
- No database changes needed
