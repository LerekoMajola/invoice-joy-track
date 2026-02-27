

## Replace Firecrawl with Free Alternatives (Jina AI Reader + Direct Fetch)

### Overview
Remove the Firecrawl dependency entirely and replace it with two free, unlimited scraping methods:
1. **Jina AI Reader** (`r.jina.ai/{url}`) -- converts any URL to clean markdown, no API key needed, completely free
2. **Direct `fetch()`** -- built-in Deno fetch for simple HTML pages, parsed to extract text

### Step 1: Disconnect Firecrawl
Use the disconnect tool to unlink the Firecrawl connection (`std_01kjexthbmfvbsfr2dw7gvhrme`) from the project.

### Step 2: Rewrite `supabase/functions/scrape-tenders/index.ts`

Replace all Firecrawl API calls with two new scraping strategies:

**For known sources (direct URLs)** -- use Jina AI Reader:
```text
// Instead of Firecrawl scrape API:
const res = await fetch(`https://r.jina.ai/${source.url}`, {
  headers: { "Accept": "text/markdown" }
});
const markdown = await res.text();
```

**For search/discovery** -- use Jina AI Search:
```text
// Instead of Firecrawl search API:
const res = await fetch(`https://s.jina.ai/${encodeURIComponent(query)}`, {
  headers: { "Accept": "text/markdown" }
});
const markdown = await res.text();
```

**Key changes:**
- Remove `FIRECRAWL_API_KEY` check entirely
- Replace the Firecrawl search loop (lines 72-102) with Jina `s.jina.ai` search calls
- Replace the Firecrawl scrape loop (lines 105-132) with Jina `r.jina.ai` reader calls
- Keep AI extraction logic (lines 141-240) and deduplication logic (lines 244-283) unchanged
- Expand `KNOWN_SOURCES` to include more Lesotho procurement sites
- Expand `SEARCH_QUERIES` to cover more sectors

**Expanded sources list:**
- `https://www.gov.ls/tenders/` -- Government of Lesotho
- `https://lesothotenders.com` -- Lesotho Tenders
- `https://www.undp.org/lesotho/procurement` -- UNDP Lesotho
- `https://procurement.gov.ls` -- Government Procurement Portal
- `https://reliefweb.int/country/lso` -- ReliefWeb Lesotho

**Expanded search queries:**
- Original 4 queries plus:
- "Lesotho procurement notice 2026"
- "Lesotho government RFP request for proposal"
- "Lesotho construction tender bid"
- "UNDP Lesotho procurement"
- "Lesotho consulting services EOI"
- "Lesotho supply delivery tender"

### What stays the same
- AI extraction via Lovable AI (Gemini Flash) -- unchanged
- Database table `scraped_tenders` -- unchanged
- Frontend Discover tab -- unchanged
- `useScrapedTenders` hook -- unchanged
- Deduplication logic -- unchanged

### Benefits
- Zero cost, no API keys needed for scraping
- No usage limits or credit tracking
- Jina Reader handles JavaScript-rendered pages better than raw fetch
- More sources and queries for broader coverage

### Files Changed
- `supabase/functions/scrape-tenders/index.ts` -- rewrite scraping logic
- Disconnect Firecrawl connector

