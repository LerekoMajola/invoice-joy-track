
# Settings Page: Replace Collapsibles with Tabs

## What Changes
Replace all the collapsible cards in the Settings page with a horizontal tab bar at the top. Each tab shows its section content below when selected.

## Tabs
The following tabs will appear in a scrollable tab bar at the top:

1. **Profile** -- Company Profile fields (default/active tab)
2. **Security** -- Change Password card
3. **Document Header** -- Header info, logo upload
4. **Notifications** -- NotificationPreferences component
5. **Backup** -- Data backup section
6. **VAT** -- VAT toggle and rate
7. **Template** -- TemplateEditor component
8. **Banking** -- Banking details fields
9. **Defaults** -- Document defaults (validity, terms, footer)
10. **Signature** -- Signature upload
11. **Documents** -- Tax clearances, business ID, company profile doc

## Layout
- The `TabsList` will use `overflow-x-auto` for mobile scrollability
- Only the active tab's content is rendered below
- The "Save All Changes" button stays at the bottom, outside the tabs (visible on all tabs)

## Technical Details

**File modified:** `src/pages/Settings.tsx`

- Remove the `CollapsibleCard` component and `Collapsible` imports
- Import `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs`
- Wrap all sections in a `Tabs` component with `defaultValue="profile"`
- Each former collapsible card becomes a `TabsContent` with a simple `Card` wrapping its content
- The `TabsList` will have compact trigger labels with icons on desktop, icons-only on mobile
- No new files, no database changes
