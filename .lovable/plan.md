

## Auto-Source Tenders from Lesotho Internet

Build an automated tender discovery system that scrapes and searches Lesotho tender websites, uses AI to extract structured tender data, and presents them in a dedicated "Discover" tab on the Tenders page.

### Architecture

```text
User clicks "Scan for Tenders"
        |
        v
Frontend --> Edge Function (scrape-tenders)
                |
                +--> Firecrawl Search API (search "tenders Lesotho")
                +--> Firecrawl Scrape API (scrape known Lesotho tender sites)
                |
                v
            Lovable AI (parse raw content into structured tender objects)
                |
                v
            Insert into scraped_tenders table
                |
                v
Frontend <-- Display results in "Discover" tab
```

### Prerequisites

**Firecrawl Connector** -- needed to scrape websites. You will be prompted to connect it before implementation begins.

### Database Changes

**New table: `scraped_tenders`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | default gen_random_uuid() |
| user_id | uuid | owner |
| company_profile_id | uuid | nullable |
| title | text | extracted tender title |
| organization | text | issuing body |
| description | text | summary |
| closing_date | text | deadline as extracted |
| reference_number | text | nullable, tender ref |
| source_url | text | where it was found |
| source_name | text | site name |
| estimated_value | text | nullable |
| category | text | nullable (construction, IT, etc.) |
| is_saved | boolean | default false (user bookmarks it) |
| is_dismissed | boolean | default false |
| scraped_at | timestamptz | default now() |
| raw_content | text | nullable, original snippet |
| created_at | timestamptz | default now() |

RLS: Users can read/update their own rows.

### Edge Function: `scrape-tenders`

1. Uses Firecrawl Search to query terms like "tenders Lesotho 2026", "RFQ Lesotho government"
2. Scrapes a curated list of known Lesotho tender sources:
   - iTenders Lesotho (ifp.lse.gov.ls)
   - LMPS procurement
   - UN procurement / ReliefWeb Lesotho
   - Lesotho government gazette
3. Sends raw scraped markdown to Lovable AI (Gemini Flash) with a structured extraction prompt
4. AI returns an array of parsed tender objects
5. Inserts new tenders into `scraped_tenders` (deduplicates by title + organization + closing_date)

### Frontend Changes

**Update `src/pages/Tenders.tsx`**
- Add a new "Discover" tab alongside Open/Submitted/Won/Lost
- "Discover" tab shows scraped tenders in cards with: title, organization, closing date, source link, category badge
- Each card has "Save" (bookmarks to your tenders list) and "Dismiss" buttons
- "Scan for Tenders" button triggers the edge function with a loading state
- Show last scan timestamp

**New hook: `src/hooks/useScrapedTenders.tsx`**
- Fetches from `scraped_tenders` where `is_dismissed = false`
- Provides `saveTender` (copies to main tenders workflow), `dismissTender`, and `scanForTenders` mutations

### Files to Create
- `supabase/functions/scrape-tenders/index.ts` -- orchestrates Firecrawl + AI parsing
- `src/hooks/useScrapedTenders.tsx` -- data hook for scraped tenders

### Files to Modify
- `src/pages/Tenders.tsx` -- add Discover tab with scan button and results grid

### How It Works for You
1. Go to Tenders page and click the "Discover" tab
2. Click "Scan for Tenders" -- the system searches across Lesotho internet sources
3. Results appear as cards showing tender title, organization, deadline, and source
4. Click "Save" to add a tender to your tracked list, or "Dismiss" to hide it
5. Previously saved tenders appear in your normal Open/Submitted/Won/Lost workflow

