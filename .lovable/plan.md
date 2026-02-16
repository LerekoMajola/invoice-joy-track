
# Add "Create Client" Button to New Quote Form

## Overview
Add a quick-action button next to the client selector in the quote creation form, allowing users to create a new client inline without leaving the form.

## Changes

### File: `src/pages/Quotes.tsx`

1. **Import the `AddClientDialog` component** and add the `UserPlus` icon from lucide-react.

2. **Add state** for controlling the inline client dialog:
   - `showAddClientDialog` (boolean)

3. **Add a "+" button** next to the "Select Client Organisation" dropdown (when not in `fromJobCard` mode). The button will sit beside the `Select` component in a flex row.

4. **Render the `AddClientDialog`** component, controlled by the new state.

5. **Auto-select the newly created client**: After the dialog closes, refetch clients and auto-select the latest one. This will be done by:
   - Importing `useClients` refetch (already available via the `clients` hook used in Quotes)
   - Watching for the dialog close and comparing the client list to detect the new entry

## Technical Details

The client selector section (around line 616-636) will change from:

```text
Label: "Select Client Organisation"
[Select dropdown]
```

To:

```text
Label: "Select Client Organisation"
[Select dropdown] [+ New Client button]
```

The `AddClientDialog` is already built and used in the CRM module -- it will be reused here. After a client is created, the `useClients` hook will be refetched and the new client auto-selected via `setSelectedClientId`.

**Files to modify:** `src/pages/Quotes.tsx` (1 file)
