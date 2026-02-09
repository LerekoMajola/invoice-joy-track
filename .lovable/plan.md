

# Persist Time Tracker Across Navigation

## Problem

The timer on the Time Tracking page is component-local state. When you navigate to another page, the component unmounts, the interval is cleared, and the timer state is lost.

## Solution

Create a **React context** that holds the timer state and persists the start timestamp to **localStorage**. This way:

- The timer keeps "running" even when you leave the page (the start time is saved, elapsed time is recalculated on return)
- A small floating indicator appears in the header/sidebar so you can see the timer is active from any page
- Clicking the floating indicator navigates you back to Time Tracking to stop/log the entry

## What Changes

| File | Action |
|------|--------|
| `src/contexts/TimerContext.tsx` | **New** -- React context providing `timerCaseId`, `timerStart`, `isRunning`, `startTimer()`, `stopTimer()`, and `elapsed` |
| `src/pages/LegalTimeTracking.tsx` | **Modify** -- Replace local timer state with the shared context |
| `src/components/layout/Header.tsx` | **Modify** -- Show a small running-timer badge when a timer is active |
| `src/App.tsx` | **Modify** -- Wrap the app tree with `TimerProvider` |

## How It Works

1. **TimerContext** stores `timerStart` (timestamp) and `timerCaseId` in both React state and `localStorage`
2. On mount, it reads from `localStorage` -- if a start time exists, it resumes the elapsed counter automatically
3. The `elapsed` value updates every second via `setInterval` inside the context (always mounted)
4. When the user stops the timer, it calculates total hours from `Date.now() - timerStart` and clears `localStorage`
5. The Header shows a pulsing clock icon with elapsed time when a timer is running; clicking it navigates to `/legal-time-tracking`

## Technical Details

### TimerContext API

```typescript
interface TimerContextValue {
  isRunning: boolean;
  timerCaseId: string;
  elapsed: number; // seconds
  startTimer: (caseId: string) => void;
  stopTimer: () => { caseId: string; hours: number } | null;
  formatElapsed: () => string;
}
```

### localStorage Keys

- `legal_timer_start` -- timestamp (number)
- `legal_timer_case_id` -- case UUID (string)

### Header Indicator

A small badge next to the bell icon showing something like "01:23:45" with a pulsing dot, only visible when a timer is active. Clicking it navigates to the time tracking page.

### LegalTimeTracking Changes

- Remove local `timerRunning`, `timerStart`, `timerCaseId`, `timerElapsed`, `timerRef` state
- Import `useTimer()` from context
- `startTimer` and `stopTimer` call context methods
- `stopTimer` returns `{ caseId, hours }` which is used to pre-fill the "Log Time" form
