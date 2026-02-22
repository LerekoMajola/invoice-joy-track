

## Attendance Page Improvements

### 1. Downloadable Proof of Payment (GymPayments)

When viewing the POP image in the payment dialog, add a "Download" button that opens the image in a new tab / triggers a file download so the admin can save it locally.

**File: `src/pages/GymPayments.tsx`**
- Add a Download button below the POP image in the dialog
- Use `window.open(popUrl, '_blank')` or create an anchor with `download` attribute

### 2. Admin Check-in for Non-App Members

The Quick Check-in search already lets admins search and check in any active member by name or member number -- this is how non-app members get checked in. No change needed here since it's already functional. The admin types the member's name and taps "Check In".

### 3. Grouped Attendance Log (One Card Per Member Per Day)

Currently every check-in creates a separate card (as seen in the screenshot with 9 separate Lereko Majola cards). This will be consolidated:

**File: `src/pages/GymAttendance.tsx`**
- Group attendance records by `member_id` using `useMemo` to create a `Map<string, GymAttendanceRecord[]>`
- Render one card per member showing:
  - Member initials, name, member number
  - Session count badge (e.g., "3 sessions")
  - Whether any session is currently active (green border) or all done
  - Check-out button if there's an active session
- Use a `Collapsible` component (already available from radix) to expand/collapse the individual check-in/out time entries underneath the main card
- Each sub-entry shows: check-in time, check-out time (or "Active"), and a check-out button if active

### Technical Details

**`src/pages/GymAttendance.tsx`** changes:
- Import `Collapsible, CollapsibleContent, CollapsibleTrigger` from `@/components/ui/collapsible`
- Import `ChevronDown, Download` from lucide-react
- Add state: `expandedMember: string | null`
- Create grouped data:
  ```
  const grouped = useMemo(() => {
    const map = new Map<string, GymAttendanceRecord[]>();
    attendance.forEach(r => {
      const list = map.get(r.member_id) || [];
      list.push(r);
      map.set(r.member_id, list);
    });
    return Array.from(map.entries());
  }, [attendance]);
  ```
- Replace the flat `attendance.map(...)` with `grouped.map(...)` rendering one collapsible card per member
- Inside the collapsible content, list each session with times and check-out buttons

**`src/pages/GymPayments.tsx`** changes:
- Add a download button/link next to the POP image:
  ```
  <a href={selectedSub.popUrl} target="_blank" rel="noopener noreferrer" download>
    <Button variant="outline" size="sm">
      <Download className="h-4 w-4 mr-1" /> Download
    </Button>
  </a>
  ```

No database changes needed.

