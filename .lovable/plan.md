

## Staff Detail: Full-View Layout and Inline Module Management

### 1. Full-View Dialog (No Scrolling)
The current dialog is 500px wide and scrolls vertically. It will be redesigned to:
- Use a wider dialog (`sm:max-w-[700px]`) with a two-column layout on desktop
- **Left column**: Staff info (name, email, phone, job title, department, dates)
- **Right column**: Role selector, Module Access checkboxes, and action buttons
- This eliminates the need to scroll by spreading content horizontally

### 2. Inline Module Access Editing
Currently, module access can only be changed when in "Edit" mode. The change:
- In **view mode**, the Module Access section will show checkboxes (not just badges) so the admin can toggle modules on/off directly without entering full edit mode
- Changes save immediately on toggle (no separate save button needed)
- A loading spinner shows while saving

---

### Technical Details

**File: `src/components/staff/StaffDetailDialog.tsx`**

- Change `DialogContent` class from `sm:max-w-[500px] max-h-[90vh] overflow-y-auto` to `sm:max-w-[700px]`
- Wrap the view-mode content in a two-column grid: `grid grid-cols-1 sm:grid-cols-2 gap-6`
  - Left side: staff details (name, email, phone, job title, department, dates, notes)
  - Right side: role selector, module access checkboxes, action buttons
- In view mode, replace the Module Access badge display with interactive checkboxes that call `saveModuleAccess` directly on toggle
- The edit form keeps its current single-column layout (it already fits well)

