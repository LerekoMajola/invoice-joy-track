
# Notification Bell Implementation Plan

A comprehensive in-app notification system that integrates with existing business events (tasks, invoices, quotes, leads) and follows best practices for real-time notifications.

---

## Overview

The notification bell in the header will display in-app notifications for important business events. This complements the existing push notification system by providing an always-accessible notification center within the app.

---

## Architecture

```text
+------------------+     +-------------------+     +------------------+
|  Business Events |---->|  notifications    |---->|  Notification    |
|  (triggers)      |     |  table            |     |  Bell UI         |
+------------------+     +-------------------+     +------------------+
                               ^                         |
                               |                         v
                         +-----+--------+        +-------+--------+
                         | Realtime     |        | NotificationPanel
                         | Subscription |        | (Sheet/Popover)
                         +--------------+        +----------------+
```

---

## Database Design

### New Table: `notifications`

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Owner of the notification |
| type | text | Category: 'task', 'invoice', 'quote', 'lead', 'system' |
| title | text | Short notification title |
| message | text | Detailed message |
| link | text | Optional navigation path (e.g., /tasks, /invoices/123) |
| reference_id | uuid | Optional ID of related entity |
| reference_type | text | Type of related entity |
| is_read | boolean | Read status (default: false) |
| created_at | timestamp | When the notification was created |

### RLS Policies
- Users can only SELECT their own notifications
- Users can UPDATE (mark as read) their own notifications
- Users can DELETE their own notifications
- INSERT via database triggers or service role only

---

## Notification Triggers (Database Functions)

### 1. Task Reminders
- Trigger: Task due date approaching (today or overdue)
- Title: "Task due today" or "Overdue task"
- Creates notification when task due_date is today and status is not 'done'

### 2. Invoice Events
- Trigger: Invoice becomes overdue (status changes to 'overdue')
- Title: "Invoice overdue"
- Trigger: Invoice paid (status changes to 'paid')
- Title: "Payment received"

### 3. Quote Events
- Trigger: Quote accepted (status changes to 'accepted')
- Title: "Quote accepted"
- Trigger: Quote expires (valid_until passes)
- Title: "Quote expired"

### 4. Lead Events
- Trigger: Follow-up due (next_follow_up is today or past)
- Title: "Lead follow-up due"
- Trigger: Lead status change to 'won'
- Title: "Deal won!"

---

## Frontend Components

### 1. useNotifications Hook

```text
src/hooks/useNotifications.tsx

Features:
- Fetch notifications with pagination
- Real-time subscription for new notifications
- Mark as read (single or all)
- Delete notification
- Unread count for badge
```

### 2. NotificationPanel Component

```text
src/components/notifications/NotificationPanel.tsx

Features:
- Popover or Sheet containing notification list
- Grouped by date (Today, Yesterday, Earlier)
- Click to navigate to related item
- Mark all as read button
- Empty state when no notifications
```

### 3. NotificationItem Component

```text
src/components/notifications/NotificationItem.tsx

Features:
- Icon based on notification type
- Title and message preview
- Relative timestamp
- Unread indicator dot
- Click to mark as read and navigate
- Swipe to delete on mobile
```

### 4. Updated Header Component

```text
src/components/layout/Header.tsx

Updates:
- Bell icon triggers NotificationPanel
- Badge shows unread count (max 99+)
- Animate badge when new notification arrives
- Remove static badge, use real count
```

---

## Implementation Phases

### Phase 1: Database Setup
1. Create `notifications` table with proper schema
2. Enable RLS with appropriate policies
3. Enable realtime for the table
4. Create indexes for performance (user_id, is_read, created_at)

### Phase 2: Database Triggers
1. Create trigger function for task due reminders
2. Create trigger function for invoice status changes
3. Create trigger function for quote status changes  
4. Create trigger function for lead follow-up reminders

### Phase 3: Frontend Hook
1. Create `useNotifications` hook with:
   - Query for fetching notifications
   - Real-time subscription
   - Mutations for mark as read, delete
   - Computed unread count

### Phase 4: UI Components
1. Create NotificationItem component
2. Create NotificationPanel component
3. Update Header to use NotificationPanel
4. Add animations and mobile optimizations

### Phase 5: Integration with Existing Systems
1. Modify existing edge function `check-task-reminders` to also create in-app notifications
2. Add notification creation to invoice/quote status change handlers
3. Connect lead follow-up checks to notification creation

---

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/hooks/useNotifications.tsx` | Hook for notification state and actions |
| `src/components/notifications/NotificationPanel.tsx` | Main notification dropdown/sheet |
| `src/components/notifications/NotificationItem.tsx` | Individual notification row |
| `src/components/notifications/index.ts` | Barrel export |

### Files to Modify
| File | Changes |
|------|---------|
| `src/components/layout/Header.tsx` | Integrate NotificationPanel, dynamic badge |
| `supabase/functions/check-task-reminders/index.ts` | Also create in-app notifications |

### SQL Migrations
1. Create notifications table
2. Create RLS policies
3. Enable realtime
4. Create trigger functions for automated notifications
5. Create cron job for daily notification checks (optional)

---

## Notification Types and Icons

| Type | Icon | Color | Example |
|------|------|-------|---------|
| task | CheckSquare | Primary | "Task 'Call client' is due today" |
| invoice | Receipt | Warning/Success | "Invoice #INV-001 is overdue" |
| quote | FileText | Info | "Quote #QUO-001 was accepted" |
| lead | Target | Violet | "Follow up with ABC Corp is due" |
| system | Bell | Muted | "Welcome to the platform!" |

---

## Real-time Updates

Enable realtime on the notifications table:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

Subscribe to changes in the hook to instantly show new notifications without page refresh.

---

## Best Practices Implemented

1. **Performance**: Pagination, indexes, efficient queries
2. **Real-time**: Instant updates via Supabase Realtime
3. **Mobile-first**: Touch-friendly, swipe actions, proper sizing
4. **Accessibility**: ARIA labels, keyboard navigation
5. **UX**: Grouped by date, clear read/unread states, smooth animations
6. **Security**: RLS policies ensure users only see their notifications
7. **Scalability**: Database triggers vs application-level creation
8. **Integration**: Works alongside existing push notification system

---

## Expected Outcome

After implementation:
1. Bell icon shows accurate unread count
2. Clicking bell opens notification panel
3. Notifications appear in real-time for business events
4. Users can mark notifications as read or delete them
5. Clicking a notification navigates to the relevant page
6. Mobile users have a smooth, touch-friendly experience
7. System integrates with existing push notification infrastructure
