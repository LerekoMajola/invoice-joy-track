

# Settings Page: Collapsible Sections and Notification Preferences

## Overview
Two changes to the Settings page:
1. Make all setting sections collapsible (accordion-style) so users can expand/collapse each card
2. Expand the Notifications section to include SMS and Email toggles, plus per-category notification channel preferences

## 1. Collapsible Setting Sections

Each Card (Company Profile, Document Header, Notifications, Data Backup, VAT Settings, Banking Details, Document Defaults, Signature, Company Documents) will be wrapped in a `Collapsible` component. Clicking the card header will expand/collapse its content. A chevron icon will indicate the open/closed state.

- Use the existing `@radix-ui/react-collapsible` component already in the project
- The card header becomes the trigger, content is wrapped in `CollapsibleContent`
- Default state: Company Profile and Notifications open, others collapsed

## 2. Enhanced Notifications Panel

Replace the current simple push notification toggle with a comprehensive notification preferences panel containing three parts:

### A. Channel Toggles (top section)
Three master toggles for notification channels:
- **Push Notifications** -- existing toggle (kept as-is)
- **SMS Notifications** -- new toggle (on/off). Shows remaining SMS credits for the month
- **Email Notifications** -- new toggle (on/off)

### B. Per-Category Preferences (below channels)
A table/list where users can control which channels are active for each notification type:

| Category | Push | SMS | Email |
|----------|------|-----|-------|
| Task Reminders | toggle | toggle | toggle |
| Invoice Updates | toggle | toggle | toggle |
| Quote Updates | toggle | toggle | toggle |
| Lead Alerts | toggle | toggle | toggle |
| Tender Reminders | toggle | toggle | toggle |
| System Alerts | toggle | toggle | toggle |

Each cell is a small checkbox. Users can granularly control which notifications go to which channel.

## 3. Database Changes

Create a new `notification_preferences` table to store per-user, per-category channel preferences:

```
notification_preferences
- id (uuid, PK)
- user_id (uuid, NOT NULL)
- sms_enabled (boolean, default false)
- email_enabled (boolean, default false)
- category_preferences (jsonb, default '{}')
  -- e.g. {"task": {"push": true, "sms": true, "email": false}, "invoice": {"push": true, "sms": true, "email": true}, ...}
- created_at (timestamptz)
- updated_at (timestamptz)
```

RLS: Users can CRUD their own rows only.

## 4. File Changes

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Wrap each Card in Collapsible, expand Notifications section |
| `src/components/settings/NotificationPreferences.tsx` | New component: SMS/Email toggles + per-category preference grid |
| `src/components/settings/PushNotificationToggle.tsx` | Keep as-is, used inside new component |
| `src/hooks/useNotificationPreferences.tsx` | New hook: fetch/save preferences from `notification_preferences` table |
| Database migration | Create `notification_preferences` table with RLS |
| `supabase/functions/send-sms-on-notification/index.ts` | Check user's preferences before sending SMS |

## Technical Details

### Collapsible Pattern
Each settings card will use:
```tsx
<Collapsible defaultOpen={isDefault}>
  <Card>
    <CollapsibleTrigger asChild>
      <CardHeader className="cursor-pointer">
        <div className="flex items-center justify-between">
          <CardTitle>...</CardTitle>
          <ChevronDown className="transition-transform" />
        </div>
      </CardHeader>
    </CollapsibleTrigger>
    <CollapsibleContent>
      <CardContent>...</CardContent>
    </CollapsibleContent>
  </Card>
</Collapsible>
```

### Notification Preferences Component
The new `NotificationPreferences` component will:
1. Render the existing `PushNotificationToggle`
2. Add an SMS toggle with credit balance display (using existing `useSmsCredits` hook)
3. Add an Email toggle
4. Render a grid of checkboxes for each notification category x channel
5. Auto-save preferences on change using the new `useNotificationPreferences` hook

### Edge Function Update
The `send-sms-on-notification` function will be updated to check the user's `notification_preferences` before sending, respecting per-category SMS opt-in/out.

