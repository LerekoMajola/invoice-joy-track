
# Style the Tab Selector on Gym Classes Page

## What's changing

The `TabsList` and `TabsTrigger` on the Gym Classes page (`/gym-classes`) currently use the default muted background with a plain white active state — low contrast and visually flat.

The fix is scoped to just this page's `<TabsList>` and `<TabsTrigger>` elements by passing custom `className` props directly.

## Changes

### `src/pages/GymClasses.tsx` — lines 71–74

**TabsList**: Give it a darker, higher-contrast background (e.g. `bg-muted/80 border border-border`) so the pill container is clearly visible.

**TabsTrigger (active)**: Override the default `data-[state=active]:bg-background` with an inline gradient using a custom class. Since Tailwind doesn't support arbitrary gradient `data-*` variants easily, the active trigger will use a wrapper approach — apply `className` with:
- Inactive: muted text, transparent background
- Active: white text, blue-purple gradient via `data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md`

## Technical details

```tsx
<TabsList className="bg-muted/60 border border-border p-1 rounded-lg h-auto">
  <TabsTrigger
    value="schedule"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium"
  >
    Weekly Schedule
  </TabsTrigger>
  <TabsTrigger
    value="classes"
    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium"
  >
    Class Library
  </TabsTrigger>
</TabsList>
```

## File to edit

- `src/pages/GymClasses.tsx` — only the TabsList/TabsTrigger block (lines 71–74)

No other files need to change. The global `tabs.tsx` UI component is left untouched so other pages are unaffected.
