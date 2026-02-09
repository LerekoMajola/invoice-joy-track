

# Job Card Full-Screen View + Quick Invoice Button

## Problem
1. The job card detail opens in a dialog with `max-h-[90vh]` requiring lots of scrolling, especially on mobile.
2. The "Generate Invoice" button is buried in the "Parts & Labour" tab and only visible when scrolled down -- easy to miss.

## Solution

### 1. Make the dialog full-screen on mobile, larger on desktop
- Change `DialogContent` from `max-w-2xl max-h-[90vh]` to full-screen on mobile (`max-h-[100dvh] h-full w-full`) and keep a comfortable large dialog on desktop (`md:max-w-3xl md:max-h-[90vh]`).
- This matches the existing mobile-first pattern described in the project's UI conventions.

### 2. Add a sticky bottom action bar
- Add a persistent footer bar at the bottom of the dialog (outside the scrollable area) with key actions:
  - **"Create Invoice"** button -- always visible when the job card status is `completed`, `quality_check`, or `invoiced` and has line items.
  - **"Update Status"** dropdown -- quick access from the bottom bar on mobile.
- This eliminates the need to navigate to a specific tab to find the invoice button.

### 3. Compact the tab content for less scrolling
- In the **Details** tab, use a tighter layout (smaller spacing, condensed vehicle info grid).
- In the **Parts & Labour** tab, keep the "Generate Invoice" button at the bottom but the sticky footer provides the primary path.

## Technical Details

### File: `src/components/workshop/JobCardDetailDialog.tsx`

**Changes:**
- Update `DialogContent` className to be full-screen on mobile: `className="max-w-3xl w-full h-[100dvh] md:h-auto md:max-h-[90vh] flex flex-col p-0"`
- Restructure layout into: fixed header, scrollable middle, sticky footer
- Move the header (title + status badge + dropdown) into a sticky top section with padding
- Wrap tab navigation + tab content in an `overflow-y-auto flex-1` container
- Add a sticky bottom bar with the "Create Invoice" button (visible when status is completed/quality_check and line items exist), plus a compact status update button on mobile
- Reduce spacing in grid layouts from `gap-4` to `gap-2`/`gap-3` for mobile compactness

No database or backend changes needed.

