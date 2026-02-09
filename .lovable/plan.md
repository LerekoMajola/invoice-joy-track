

# Add Guest House Management as 6th Industry Vertical

## Overview

Add a full "Guest House" system type to the platform, covering room management, booking calendar, guest registry, housekeeping status, meal plans, and reviews. This requires database schema changes, new pages and components, navigation updates, and updates to all landing/auth/admin surfaces.

## Identity

- **System key**: `guesthouse`
- **Label**: Guest House
- **Icon**: `Hotel` (from lucide-react)
- **Gradient**: `from-rose-500 to-pink-500`
- **Starting price**: M650/mo

---

## 1. Database Changes

### 1a. Update system_type constraint

```sql
ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_system_type_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_system_type_check
  CHECK (system_type = ANY (ARRAY['business', 'workshop', 'school', 'legal', 'hire', 'guesthouse']));
```

### 1b. New tables

**`rooms`** -- Room catalogue

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | -- | Owner |
| room_number | text | -- | e.g. "101" |
| room_type | text | 'standard' | standard, deluxe, suite, dormitory |
| name | text | -- | e.g. "Mountain View Suite" |
| capacity | integer | 2 | Max guests |
| daily_rate | numeric | 0 | Base nightly rate |
| amenities | text | null | Comma-separated or JSON |
| status | text | 'available' | available, occupied, maintenance, blocked |
| description | text | null | |
| created_at | timestamptz | now() | |

RLS: user_id = auth.uid() for all CRUD.

**`bookings`** -- Guest reservations

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | -- | Owner |
| room_id | uuid | -- | FK to rooms |
| booking_number | text | -- | Auto-generated |
| guest_name | text | -- | |
| guest_email | text | null | |
| guest_phone | text | null | |
| guest_id_number | text | null | ID/passport |
| num_guests | integer | 1 | |
| check_in | date | -- | |
| check_out | date | -- | |
| actual_check_in | timestamptz | null | |
| actual_check_out | timestamptz | null | |
| status | text | 'confirmed' | confirmed, checked_in, checked_out, cancelled, no_show |
| total | numeric | 0 | |
| deposit_paid | numeric | 0 | |
| meal_plan | text | 'none' | none, breakfast, half_board, full_board |
| special_requests | text | null | |
| notes | text | null | |
| created_at | timestamptz | now() | |
| updated_at | timestamptz | now() | |

RLS: user_id = auth.uid() for all CRUD.

**`housekeeping_tasks`** -- Room cleaning/maintenance

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | -- | Owner |
| room_id | uuid | -- | FK to rooms |
| task_type | text | 'cleaning' | cleaning, maintenance, inspection |
| status | text | 'pending' | pending, in_progress, completed |
| assigned_to | text | null | Staff name |
| priority | text | 'normal' | low, normal, urgent |
| notes | text | null | |
| completed_at | timestamptz | null | |
| created_at | timestamptz | now() | |

RLS: user_id = auth.uid() for all CRUD.

**`guest_reviews`** -- Guest feedback

| Column | Type | Default | Notes |
|--------|------|---------|-------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | -- | Owner |
| booking_id | uuid | -- | FK to bookings |
| rating | integer | -- | 1-5 |
| comment | text | null | |
| source | text | 'direct' | direct, google, booking_com, tripadvisor |
| created_at | timestamptz | now() | |

RLS: user_id = auth.uid() for all CRUD.

---

## 2. New Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useRooms.tsx` | CRUD for rooms table, room status management |
| `src/hooks/useBookings.tsx` | CRUD for bookings, check-in/check-out mutations, availability queries |
| `src/hooks/useHousekeeping.tsx` | CRUD for housekeeping_tasks, status updates |
| `src/hooks/useGuestReviews.tsx` | CRUD for guest_reviews, average rating calculation |

---

## 3. New Pages

| File | Route | Description |
|------|-------|-------------|
| `src/pages/GuestHouseDashboard.tsx` | (via Dashboard.tsx) | Overview: occupancy rate, today's check-ins/outs, revenue, recent bookings, housekeeping alerts |
| `src/pages/Rooms.tsx` | `/rooms` | Room catalogue with cards showing status, type, rate. Add/edit room dialog |
| `src/pages/Bookings.tsx` | `/bookings` | List/calendar of bookings, add booking dialog with room picker and date range, check-in/check-out buttons |
| `src/pages/Housekeeping.tsx` | `/housekeeping` | Task board showing rooms needing attention, filterable by status/priority |
| `src/pages/GuestReviews.tsx` | `/guest-reviews` | Review list with star ratings, average score, source breakdown |

---

## 4. New Components

| File | Purpose |
|------|---------|
| `src/components/guesthouse/AddRoomDialog.tsx` | Form: room number, type, name, capacity, daily rate, amenities |
| `src/components/guesthouse/AddBookingDialog.tsx` | Form: guest details, room picker (filtered by availability), dates, meal plan, deposit |
| `src/components/guesthouse/CheckInOutDialog.tsx` | Quick check-in/check-out workflow |
| `src/components/guesthouse/HousekeepingCard.tsx` | Card per room showing task status |
| `src/components/guesthouse/BookingCalendarView.tsx` | Monthly grid showing room bookings (similar pattern to HireCalendar) |

---

## 5. System Registration Updates

These files need the `guesthouse` type added:

| File | Change |
|------|--------|
| `src/components/auth/SystemSelector.tsx` | Add `SystemType = '... \| guesthouse'`, add entry to `systems[]` with Hotel icon, rose gradient, M650 price |
| `src/components/auth/PackageTierSelector.tsx` | Add `guesthouseTiers` array (Starter M650, Professional M850, Enterprise M1100) and `SYSTEM_CONFIG.guesthouse` |
| `src/hooks/useSubscription.tsx` | Add `'guesthouse'` to `SystemType` union |
| `src/pages/Auth.tsx` | Add `'guesthouse'` to valid system params array, add to `SYSTEM_META` with Hotel icon |
| `src/pages/Dashboard.tsx` | Add `case 'guesthouse': return <GuestHouseDashboard />` |

---

## 6. Navigation Updates

| File | Change |
|------|--------|
| `src/components/layout/Sidebar.tsx` | Add Guest House nav items: Rooms, Bookings, Housekeeping, Reviews (all `systemTypes: ['guesthouse']`) |
| `src/components/layout/BottomNav.tsx` | Add Rooms + Bookings for guesthouse |
| `src/components/layout/MoreMenuSheet.tsx` | Add Housekeeping + Reviews for guesthouse |
| `src/App.tsx` | Add routes: `/rooms`, `/bookings`, `/housekeeping`, `/guest-reviews` |

---

## 7. Landing & Branding Updates

| File | Change |
|------|--------|
| `src/components/landing/Hero.tsx` | Add Hotel icon to the 6 floating industry icons |
| `src/components/landing/Solutions.tsx` | Add Guest House card with features: Room Management, Booking Calendar, Housekeeping, Guest Reviews |
| `src/components/landing/Footer.tsx` | Add "Guest House" to Solutions column |
| `src/components/auth/AuthBrandingPanel.tsx` | Add "Guest House" to industry pills, update "Six Industries" |
| `src/components/landing/PricingTable.tsx` | Add guesthouse pricing row if present |

---

## 8. Admin Updates

| File | Change |
|------|--------|
| `src/components/admin/ModuleManagement.tsx` | Add `guesthouse` to `systemGroups[]` with Hotel icon and rose gradient |

---

## 9. Package Tiers

**Guest House tiers:**

| Tier | Price | Modules |
|------|-------|---------|
| Starter (M650) | Rooms, Bookings, Invoices, Tasks, Staff |
| Professional (M850) | + Housekeeping, Accounting, Reviews |
| Enterprise (M1100) | + Meal Plans, Channel Integration, CRM |

**Module keys**: `gh_rooms`, `gh_bookings`, `gh_housekeeping`, `gh_reviews`

---

## Files Summary

| File | Action |
|------|--------|
| Database migration | New tables + constraint update |
| `src/hooks/useRooms.tsx` | **New** |
| `src/hooks/useBookings.tsx` | **New** |
| `src/hooks/useHousekeeping.tsx` | **New** |
| `src/hooks/useGuestReviews.tsx` | **New** |
| `src/pages/GuestHouseDashboard.tsx` | **New** |
| `src/pages/Rooms.tsx` | **New** |
| `src/pages/Bookings.tsx` | **New** |
| `src/pages/Housekeeping.tsx` | **New** |
| `src/pages/GuestReviews.tsx` | **New** |
| `src/components/guesthouse/AddRoomDialog.tsx` | **New** |
| `src/components/guesthouse/AddBookingDialog.tsx` | **New** |
| `src/components/guesthouse/CheckInOutDialog.tsx` | **New** |
| `src/components/guesthouse/HousekeepingCard.tsx` | **New** |
| `src/components/guesthouse/BookingCalendarView.tsx` | **New** |
| `src/components/auth/SystemSelector.tsx` | Update -- add guesthouse |
| `src/components/auth/PackageTierSelector.tsx` | Update -- add guesthouse tiers |
| `src/hooks/useSubscription.tsx` | Update -- add type |
| `src/pages/Auth.tsx` | Update -- add guesthouse to validation + meta |
| `src/pages/Dashboard.tsx` | Update -- add guesthouse case |
| `src/components/layout/Sidebar.tsx` | Update -- add nav items |
| `src/components/layout/BottomNav.tsx` | Update -- add nav items |
| `src/components/layout/MoreMenuSheet.tsx` | Update -- add menu items |
| `src/App.tsx` | Update -- add routes |
| `src/components/landing/Hero.tsx` | Update -- add 6th icon |
| `src/components/landing/Solutions.tsx` | Update -- add card |
| `src/components/landing/Footer.tsx` | Update -- add link |
| `src/components/auth/AuthBrandingPanel.tsx` | Update -- add pill, update copy |
| `src/components/admin/ModuleManagement.tsx` | Update -- add group |

