
# Gym Members Management and Membership Subscriptions

Build a full-featured member management system for the GymPro vertical, following international fitness industry standards (IHRSA/EuropeActive patterns).

## What You'll Get

- **Member Registry**: Full member profiles with personal details, emergency contacts, health declarations, and membership ID cards
- **Membership Plans**: Define plans (Monthly, Quarterly, Annual, Day Pass, etc.) with pricing and benefits
- **Member Subscriptions**: Track each member's active plan, start/end dates, auto-renewal, and payment status
- **Freeze/Hold**: Members can freeze their membership (injury, travel) -- standard practice worldwide
- **Status Lifecycle**: Prospect > Active > Frozen > Expired > Cancelled
- **Dashboard Stats**: Live counters for total members, active, expiring soon, and revenue

## Database Tables

### 1. `gym_membership_plans` -- The plans a gym offers
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| user_id | uuid | Owner (gym operator) |
| company_profile_id | uuid | Multi-company support |
| name | text | e.g. "Monthly Unlimited" |
| description | text | Plan details |
| duration_days | int | 30, 90, 365, 1, etc. |
| price | numeric | Cost per cycle |
| category | text | monthly, quarterly, annual, day_pass, custom |
| max_freezes | int | How many freezes allowed per cycle |
| is_active | boolean | Whether plan is currently offered |
| created_at / updated_at | timestamp | Audit trail |

### 2. `gym_members` -- Member profiles
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| user_id | uuid | Owner (gym operator) |
| company_profile_id | uuid | Multi-company |
| member_number | text | Auto-generated MEM-0001 |
| first_name, last_name | text | Identity |
| email, phone | text | Contact |
| date_of_birth | date | Age verification |
| gender | text | Demographics |
| address | text | Address |
| emergency_contact_name | text | Required by industry standard |
| emergency_contact_phone | text | Required by industry standard |
| health_conditions | text | Medical disclosure |
| photo_url | text | Member photo |
| join_date | date | When they joined |
| status | text | prospect, active, frozen, expired, cancelled |
| notes | text | Internal notes |
| created_at / updated_at | timestamp | Audit |

### 3. `gym_member_subscriptions` -- Tracks which plan each member is on
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid | Primary key |
| user_id | uuid | Owner |
| company_profile_id | uuid | Multi-company |
| member_id | uuid FK | Links to gym_members |
| plan_id | uuid FK | Links to gym_membership_plans |
| start_date | date | When subscription begins |
| end_date | date | When it expires |
| status | text | active, frozen, expired, cancelled |
| freeze_start | date | If currently frozen |
| freeze_end | date | Expected unfreeze date |
| freezes_used | int | Count of freezes used this cycle |
| payment_status | text | paid, pending, overdue |
| amount_paid | numeric | What was paid |
| auto_renew | boolean | Auto-renewal flag |
| notes | text | |
| created_at / updated_at | timestamp | Audit |

### RLS Policies
All three tables follow the standard owner pattern:
- `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE
- Staff access via `EXISTS (SELECT 1 FROM staff_members WHERE staff_members.user_id = auth.uid() AND staff_members.owner_user_id = gym_members.user_id)`

## Frontend Components

### Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useGymMembers.tsx` | CRUD hook for gym_members (follows useStudents pattern) |
| `src/hooks/useGymMembershipPlans.tsx` | CRUD hook for membership plans |
| `src/hooks/useGymMemberSubscriptions.tsx` | CRUD hook for member subscriptions |
| `src/components/gym/AddMemberDialog.tsx` | Form: personal info, emergency contact, health declaration |
| `src/components/gym/MemberDetailDialog.tsx` | Full member view with subscription history, freeze controls |
| `src/components/gym/AddMembershipPlanDialog.tsx` | Create/edit membership plan |
| `src/components/gym/AssignPlanDialog.tsx` | Assign a plan to a member with payment recording |
| `src/components/gym/MemberCard.tsx` | Mobile card view for member list |

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/GymMembers.tsx` | Replace placeholder with full member list (search, filter, stats, table + mobile cards) |
| `src/pages/GymDashboard.tsx` | Wire up live stats from gym_members and subscriptions |

## Page Layout (GymMembers)

- **Header**: "Members" with "Add Member" button
- **Stats Row**: Total Members, Active, Expiring This Month, Frozen
- **Tabs**: Members | Membership Plans
- **Members Tab**: Search + status filter, desktop table + mobile cards, click to view detail
- **Plans Tab**: List of available plans with add/edit/deactivate controls

## Member Detail Dialog

- **Profile Section**: Photo placeholder, name, member number, status badge, contact info
- **Emergency Contact**: Name + phone (highlighted for safety)
- **Health Declaration**: Any disclosed conditions
- **Current Subscription**: Plan name, dates, payment status, days remaining progress bar
- **Actions**: Assign Plan, Freeze Membership, Edit, Cancel Membership
- **Subscription History**: Table of past and current subscriptions

## Technical Notes

- Member number auto-generation: `MEM-0001`, `MEM-0002`, etc. (same pattern as student admission numbers)
- All queries scoped by `company_profile_id` via ActiveCompanyContext
- Status transitions enforced in application logic (not database constraints, per project convention)
- Currency formatting via `useCurrency()` hook
- Responsive design: mobile cards + desktop table (same pattern as Students page)
