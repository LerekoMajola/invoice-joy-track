

## Add Edit Member Functionality

### Summary
Add an "Edit" button to the Member Detail Dialog that toggles the profile section into an editable form, allowing you to update member details like email, phone, name, etc.

### What Changes

**File: `src/components/gym/MemberDetailDialog.tsx`**

1. Add an `isEditing` state toggle and an `editData` state object pre-filled with the member's current info
2. Add an "Edit" button next to the member name/status area
3. When editing, replace the read-only profile fields with input fields for: First Name, Last Name, Email, Phone, Date of Birth, Gender, Address, Emergency Contact Name, Emergency Contact Phone, Health Conditions, and Notes
4. Add "Save" and "Cancel" buttons that call the existing `onUpdate` prop or revert changes
5. On save, call `onUpdate(member.id, editData)` which already handles the database update via the `useGymMembers` hook

### Fields Editable
- First Name, Last Name
- Email, Phone
- Date of Birth, Gender
- Address
- Emergency Contact (Name and Phone)
- Health Conditions
- Notes

### No database or hook changes needed
The `onUpdate` function from `useGymMembers` already supports updating all these fields.
