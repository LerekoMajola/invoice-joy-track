
## Admin CRM — Platform Sales Prospect Tracker

### What This Builds

A dedicated "CRM" tab inside the `/admin` console for the super-admin to track **platform-level sales prospects** (companies/people who might subscribe). This is completely separate from the tenant-side CRM — it is a tool for you (the platform owner) to manage your own sales pipeline.

---

### Core Features

1. **Kanban Pipeline Board** — 7 stages: Lead → Contacted → Demo Booked → Proposal Sent → Negotiation → Won → Lost. Drag-and-drop cards between stages.
2. **Prospect List View** — searchable, filterable table of all prospects.
3. **Prospect Detail Sheet** — slide-in panel with full edit form, activity log (notes/calls/emails), and follow-up scheduling.
4. **Add Prospect Dialog** — quick form to add company, contact name, email, phone, expected plan, and estimated value.
5. **Activity Log** — log calls, emails, demos, and notes against each prospect. Timestamped timeline.
6. **Stats Bar** — total pipeline value, weighted value, # active prospects, # follow-ups due today.

---

### Database Changes

Two new tables, admin-only (no RLS exposure to tenants):

**`admin_prospects`**
```
id, created_at, updated_at,
contact_name, company_name, email, phone,
status (text: lead/contacted/demo/proposal/negotiation/won/lost),
priority (text: low/medium/high),
estimated_value (numeric),
expected_close_date (date),
win_probability (int),
source (text),
notes (text),
next_follow_up (date),
stage_entered_at (timestamptz),
loss_reason (text),
interested_plan (text),
interested_system (text)
```

**`admin_prospect_activities`**
```
id, created_at,
prospect_id (FK → admin_prospects),
type (text: note/call/email/demo/meeting),
title (text),
description (text)
```

RLS: Both tables restricted to authenticated users with `super_admin` role using the existing `has_role()` security definer function.

---

### Files to Create / Modify

**New files:**
- `src/hooks/useAdminProspects.tsx` — CRUD for prospects + activities
- `src/components/admin/crm/AdminCRMTab.tsx` — main CRM tab (pipeline + list views + stats)
- `src/components/admin/crm/ProspectKanban.tsx` — drag-and-drop Kanban board
- `src/components/admin/crm/ProspectCard.tsx` — card for Kanban column
- `src/components/admin/crm/ProspectDetailSheet.tsx` — slide-in detail panel (edit + activity log)
- `src/components/admin/crm/AddProspectDialog.tsx` — add prospect form
- `supabase/migrations/TIMESTAMP_admin_crm.sql` — creates both tables with RLS

**Modified files:**
- `src/pages/Admin.tsx` — add "CRM" tab trigger + content
- `src/components/admin/index.ts` — export new `AdminCRMTab`

---

### Pipeline Stages

| Stage | Color | Default Win% |
|---|---|---|
| Lead | Blue | 5% |
| Contacted | Purple | 15% |
| Demo | Teal | 35% |
| Proposal | Yellow | 55% |
| Negotiation | Orange | 75% |
| Won | Green | 100% |
| Lost | Red | 0% |

---

### Technical Details

**RLS Policies (both tables):**
```sql
CREATE POLICY "Super admins only" ON admin_prospects
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));
```

**Hook pattern** (`useAdminProspects`): follows the same pattern as `useCRMClients` / `useDeals` — local state updated optimistically, Supabase as source of truth, `toast` notifications on errors.

**Kanban drag-and-drop**: Uses native HTML5 drag events (same pattern as `PipelineBoard.tsx` in the tenant CRM) — no extra library needed.

**Stats computation**: Derived from the prospects array in-memory (no extra DB calls). Weighted pipeline = Σ(value × win_probability).

**Activity log**: Stored in `admin_prospect_activities`, fetched per prospect when detail sheet opens. Add activity form is inline inside the sheet.
