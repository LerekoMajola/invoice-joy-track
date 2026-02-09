

# Simplify Job Card Flow + Add Costs As You Go

## The Problems

1. **Too many statuses are confusing**: The current flow has 11 statuses (received, diagnosing, diagnosed, quoted, approved, in_progress, awaiting_parts, quality_check, completed, invoiced, collected). Users must manually pick from a flat dropdown list with no guidance on what comes next.

2. **Adding parts/labour requires switching tabs**: To add costs while working, you must navigate to the "Parts & Labour" tab, fill a form, then go back. This friction discourages updating costs as work progresses.

3. **No visual flow indicator**: There's no way to see where you are in the job's lifecycle at a glance.

## Solution

### 1. Replace the flat status dropdown with a guided "Next Step" button

Instead of a dropdown listing all 11 statuses, show a single prominent **"Next Step"** button that automatically suggests the logical next action based on the current status:

| Current Status | Next Step Button | 
|---|---|
| Received | "Start Diagnosis" |
| Diagnosing | "Mark Diagnosed" |
| Diagnosed | "Create Quote" (navigates to quote) |
| Quoted | "Mark Approved" |
| Approved | "Start Work" |
| In Progress | "Mark Completed" |
| Quality Check | "Mark Completed" |
| Completed | "Create Invoice" |

A small "More actions" overflow allows setting special statuses like "Awaiting Parts" or going back. This way the user always knows the one thing to do next.

### 2. Add a quick "Add Cost" inline form to the sticky bottom bar

Add a collapsible "Add Cost" button in the sticky footer that expands a compact inline form (description, qty, price, type) right at the bottom of the screen. This lets technicians add parts and labour from any tab without switching context. The running total updates live in the footer.

### 3. Show a compact progress stepper in the header

Add a small horizontal progress indicator below the job card number showing the simplified stages: **Intake -> Diagnosis -> Quote -> Work -> Complete -> Invoice**. The current stage is highlighted, giving instant context.

### 4. Always show the running total in the footer

Display the current total (e.g., "M1,250.00") in the sticky bottom bar so users always see how costs are accumulating without navigating to the Parts & Labour tab.

## Technical Details

### File: `src/components/workshop/JobCardDetailDialog.tsx`

**Changes:**

- **Progress stepper**: Add a row of 6 small dots/steps below the header showing: Intake, Diagnosis, Quote, Work, Complete, Invoice. Map each of the 11 statuses to one of these 6 stages. Highlight completed stages and the current stage.

- **Next Step button**: Replace the "Update Status" dropdown as the primary action. Add a `getNextAction(status)` function that returns `{ label, status, icon }` for the logical next step. Keep a secondary "..." button that opens the full status dropdown for edge cases (awaiting parts, etc.).

- **Quick Add Cost panel**: Add a state `showQuickAdd` toggled by a "+" button in the footer. When open, render a compact row: type select (Parts/Labour), description input, qty input, price input, and an "Add" button. This sits above the footer bar.

- **Running total in footer**: Always show `formatMaluti(total)` in the sticky bar alongside the action buttons.

### File: `src/hooks/useJobCards.tsx`

No changes needed -- the existing `addLineItem`, `updateStatus` functions support everything.

### No database changes needed.

