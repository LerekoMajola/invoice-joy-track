

# Source Cost Prices from the Internet

After extracting line items from your uploaded document, the system will automatically search the internet for supplier/wholesale prices and fill in the cost price for each item.

## How it will work

1. You upload a document as before
2. The AI extracts line items (descriptions, quantities, selling prices)
3. For each line item, the system searches the web for supplier/trade/wholesale prices
4. Cost prices are automatically filled in based on real market data
5. You review and adjust before saving

## Technical approach

### 1. Connect Perplexity (AI-powered web search)
- Perplexity's "sonar" model performs real-time web searches and returns grounded answers with citations
- This gives actual current market pricing rather than guesses

### 2. New edge function: `search-cost-prices`
- Receives an array of line item descriptions
- For each item, queries Perplexity to find supplier/wholesale/trade prices in the relevant market (South Africa / user's region)
- Returns an array of estimated cost prices with confidence notes
- Handles rate limits and errors gracefully

### 3. Update the quote upload flow (`src/pages/Quotes.tsx`)
- After the document is parsed and line items are extracted, automatically call the new `search-cost-prices` function
- Show a secondary loading state: "Searching for supplier prices..."
- Fill in `costPrice` for each line item where a price was found
- Show a toast: "Supplier prices found -- please verify before saving"

## Files to create/modify

| File | Action |
|------|--------|
| `supabase/functions/search-cost-prices/index.ts` | Create -- web search for supplier pricing |
| `src/pages/Quotes.tsx` | Update -- call price search after document parse, populate costPrice fields |

### Edge function: `search-cost-prices`

- Accepts: `{ items: [{ description: string, unitPrice?: number }], region?: string }`
- For each item, sends a Perplexity search query like: `"wholesale supplier price for [description] in South Africa"`
- Parses the AI response to extract a numeric price
- Returns: `{ prices: [{ description: string, costPrice: number | null, source: string, confidence: string }] }`
- Batches items into a single Perplexity call where possible to reduce API usage

### Quote page update

- After `extract-quote-from-document` returns, automatically triggers `search-cost-prices` with the extracted line items
- Updates each line item's `costPrice` with the result
- Items where no price was found keep costPrice as 0 for manual entry

## Prerequisites

- Perplexity connector must be enabled (you'll be prompted to connect it)

