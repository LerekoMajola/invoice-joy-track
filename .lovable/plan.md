
# Apply Blue-Purple Gradient Tabs to Staff Page

## What's changing

The Staff page (`/staff`) has Overview and Payroll tabs that currently use the default plain white selected style — matching the screenshot the user shared. The fix applies the exact same styled `TabsList` and `TabsTrigger` classes already used on the Gym Classes page.

## Change

### `src/pages/Staff.tsx` — lines 36–45

Replace the bare `<TabsList>` and `<TabsTrigger>` elements with the same gradient styling:

```tsx
<TabsList className="bg-muted/60 border border-border p-1 rounded-lg h-auto">
  <TabsTrigger
    value="overview"
    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium"
  >
    <Users className="h-4 w-4" />
    Overview
  </TabsTrigger>
  <TabsTrigger
    value="payroll"
    className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md rounded-md font-medium"
  >
    <Receipt className="h-4 w-4" />
    Payroll
  </TabsTrigger>
</TabsList>
```

## File to edit

- `src/pages/Staff.tsx` — only the TabsList/TabsTrigger block (lines 36–45)

No other files need to change. This is identical to the pattern already applied on the Gym Classes page.
