
## Gym Home Tab: Attendance Stats + Daily Motivation — Incredible Shareable Design

### What's Being Built

The Home tab (`GymMemberPortal.tsx`) is getting a complete redesign. Instead of a plain profile overview, it becomes a **daily fitness dashboard** — the screen a member wakes up and checks every morning. It will feature:

1. **Personalized hero greeting** with time-of-day awareness ("Good Morning ☀️", "Good Evening 🌙")
2. **Live attendance stats pulled in from the database** — monthly visits, current streak, last visit date
3. **Daily rotating motivational quote** — a curated list cycling by day-of-year so it's different every day
4. **A shareable "Daily Stats Card"** — beautiful gradient card they can screenshot and post to Instagram/WhatsApp Stories, showing their streak + monthly count + quote
5. **Membership status pill** — compact, at the top — not the huge card it currently is (the full plan detail stays on the Plan tab)
6. **Today's check-in status strip** — shows if they're checked in today or prompts them to go check in

---

### Design Vision

The page is structured like a fitness super-app's home screen:

```text
┌─────────────────────────────────────────┐
│  Good Morning, Sarah ☀️         [ACTIVE]│
│  Thursday · 20 Feb                      │
│─────────────────────────────────────────│
│                                         │
│  ┌─── TODAY ──────────────────────────┐ │
│  │  ✓ Checked in at 07:34 AM  💪      │ │
│  └────────────────────────────────────┘ │
│                                         │
│  ╔══════════════════════════════════╗   │
│  ║  🔥 12        ⚡ 5         🏆 31  ║  │
│  ║  Day Streak   This Month  Total  ║   │
│  ╚══════════════════════════════════╝   │
│                                         │
│  ┌─────── DAILY MOTIVATION ──────────┐  │
│  │  "The only bad workout is the     │  │
│  │   one that didn't happen."        │  │
│  │                    — Unknown      │  │
│  │         [📸 Share this]           │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌── SHAREABLE CARD ─────────────────┐  │
│  │  Gradient card — name, streak,    │  │
│  │  monthly visits, quote, gym name  │  │
│  │  + OrionBiz watermark             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌── MY PLAN ────────────────────────┐  │
│  │  Premium · Expires 30 Mar · 38d   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### Data Fetched on Home Tab

The home tab will now pull the same attendance data as the Check In tab, plus the subscription summary (compact version). Specifically:

- Today's check-in record (to show "Checked in ✓" or "Not yet checked in")
- Monthly visit count (from `gym_attendance` WHERE `check_in >= start of month`)
- All-time visit count (total `gym_attendance` rows for this member)
- Streak (last 30 days rolling calculation — same logic as `GymPortalAttendance`)
- Active subscription (compact — just plan name + end date)
- Gym name from `company_profiles`

All fetched in a single `Promise.all` so there's one loading state.

---

### Daily Motivation System

A hardcoded array of 30 curated fitness/motivation quotes. The active quote is selected by `dayOfYear % quotes.length` — so it rotates automatically, changes each day, and requires no backend:

```typescript
const QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
  { text: "Sweat is just fat crying.", author: "Unknown" },
  // ... 27 more
];
const todayQuote = QUOTES[getDayOfYear(new Date()) % QUOTES.length];
```

---

### The Shareable Card (on Home tab)

A redesigned shareable card lives on the Home tab (not hidden behind Check In). It's always visible once data loads, showing:

- Full-bleed gradient (primary color, diagonal)
- Member name + gym name
- Today's quote in quotes
- Streak badge + monthly count badge
- Check-in status for today
- "Share Your Progress" button → `navigator.share()` on mobile

The card is designed as a **9:16 portrait-ish block** that screenshotted looks perfect for Instagram Stories.

---

### What Changes

| File | What changes |
|---|---|
| `src/components/portal/gym/GymMemberPortal.tsx` | Complete redesign: fetch attendance stats + gym info + subscription summary; time-aware greeting; stats bar; daily quote; shareable card; compact membership strip |

No database changes needed — the existing `gym_attendance` table with the RLS policies added in the last migration already supports this. No new edge functions. No new packages.

The existing `GymPortalAttendance.tsx` (Check In tab) remains unchanged — it still handles the actual check-in action. The Home tab shows the stats passively and links the user to go check in if they haven't yet today.

---

### Stat Definitions (what members care about)

- **Day Streak** 🔥 — consecutive days with at least one check-in. Everyone chases this.
- **This Month** ⚡ — total visits in the current calendar month. Gym owners often use "12 visits = good month" as a benchmark.
- **All Time** 🏆 — total lifetime visits. A vanity metric members love.
- **Last Visit** 📅 — date of last attendance (shown subtly below stats).

These are the four numbers every fitness app (Peloton, MyFitnessPal, Strava) puts on the home screen because they drive retention through accountability.
