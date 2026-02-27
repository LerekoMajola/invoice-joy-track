

## Fix: Tender Source Link Notifications Not Repeating

### Problem
The `check-tender-links` function has a deduplication check that prevents creating a new notification if **any unread notification** already exists for that link. Since you don't always clear/read old tender notifications, the system never sends new ones -- it thinks "already notified" even if the old notification is weeks old.

**Current data confirms this**: 7 links are stale, but only 1 notification was created (for a brand-new link). The other 6 have unread notifications from February 5-7 blocking new ones.

### Solution
Change the deduplication logic in the edge function to only skip if a notification was created **within the last 2 days** (instead of checking for any unread notification). This way, you get a fresh reminder every ~2 days for links you haven't visited.

### Changes

**File: `supabase/functions/check-tender-links/index.ts`**

Replace the existing notification check (lines 43-56) from:
```text
// Check if we already have an unread notification for this link
.eq("is_read", false)
.single();
```

To:
```text
// Check if we already sent a notification for this link in the last 2 days
.gte("created_at", twoDaysAgoISO)
.single();
```

This removes the `is_read` filter and instead uses a **time-based** window -- if a notification was already created in the last 2 days for this link, skip it. Otherwise, create a fresh one regardless of whether older ones are unread.

### Impact
- You will receive a tender reminder notification every ~2 days for each unvisited link
- Visiting a link resets its `last_visited_at`, removing it from the stale list
- No database migration needed -- only the edge function code changes
