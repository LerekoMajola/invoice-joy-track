

# Add Client Directly from Job Card Creation

## What Changes

Right now, to create a job card you must first go to the Clients page, add a client there, then come back to Workshop and create the job card. This adds an "Add New Client" option directly inside the Create Job Card dialog so you can do it all in one place -- including capturing their phone number for WhatsApp alerts.

## How It Works

1. **"+ Add New Client" link** appears below the client dropdown (similar to the existing "+ Add to your team" link for staff)
2. Clicking it opens a compact inline form (or the existing AddClientDialog) to capture: Name, Contact Person, Phone, Email, Address
3. After saving, the new client is automatically selected in the job card form
4. The job card is then linked to this client, so their phone number is available for WhatsApp alerts later

## Technical Details

### File: `src/components/workshop/CreateJobCardDialog.tsx`

- Import the `AddClientDialog` component from `src/components/crm/AddClientDialog.tsx` (already exists and handles client creation with phone number)
- Add a `showAddClient` state (same pattern as the existing `showAddStaff`)
- Add a "+ Add new client" link below the client Select dropdown, styled the same as the "+ Add to your team" link (using `UserPlus` icon)
- After the AddClientDialog closes, call `refetch()` from `useClients` to reload the clients list
- Auto-select the newly created client: compare the refreshed clients list to find the new entry and set `clientId` + `clientName`

**Changes summary:**
- Add `showAddClient` state
- Add `handleAddClientClose` callback that refetches clients and auto-selects the newest one
- Add the `UserPlus` / `Plus` link below the client selector
- Render `<AddClientDialog>` alongside the existing `<AddStaffDialog>`

### No database or backend changes needed
The `AddClientDialog` already saves the phone number to the `clients` table, and the WhatsApp feature already reads from there.
