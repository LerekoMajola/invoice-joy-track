

## Make Clients Clickable to Edit on the /clients Page

### Problem
On the Clients page (`/clients`), you currently have to click the three-dot menu and select "Edit" to modify a client. You should be able to simply click on a client row or card to open the edit dialog directly.

### Changes

**`src/pages/Clients.tsx`** -- Make rows and cards clickable:

1. **Mobile cards**: Add an `onClick` handler to the `ClientCard` component so tapping a client card opens the edit dialog (calls `handleEditClick`).

2. **Desktop table rows**: Add `onClick={() => handleEditClick(client)}` and `className="cursor-pointer hover:bg-muted/50"` to each `TableRow`, so clicking anywhere on the row opens the edit dialog. The dropdown menu cell will use `e.stopPropagation()` to prevent the row click from firing when using the menu.

### What This Means
After this change, you can simply click/tap on any client to immediately open the edit form with their details pre-filled, ready to update.

