

## Add "Subscribe" Button Next to "Start Free Trial"

### What Changes
**File: `src/components/auth/ModuleSelector.tsx`**

- Update the `onComplete` callback signature to accept a second parameter: `isTrial: boolean`
- Add a "Subscribe" button next to the existing "Start Free Trial" button in the summary bar
- "Start Free Trial" calls `onComplete(moduleIds, true)` (trial flow)
- "Subscribe" calls `onComplete(moduleIds, false)` (direct subscribe flow)
- Both buttons share the same disabled/loading state
- "Subscribe" uses a solid `default` variant, "Start Free Trial" keeps `gradient`

**File: `src/pages/Auth.tsx`**

- Update `handleModulesComplete` to accept the `isTrial` boolean
- Store the trial/subscribe choice in state so the review step and final signup can use it (e.g. set subscription status to `active` instead of `trial` when subscribing directly)

### Layout
The summary bar buttons will stack on mobile and sit side-by-side on desktop:
- **Start Free Trial** (gradient, primary CTA)
- **Subscribe** (outline/secondary style)

### Technical Details

| Component | Change |
|-----------|--------|
| `ModuleSelectorProps.onComplete` | `(ids: string[], isTrial: boolean) => void` |
| Summary bar | Add second button "Subscribe" |
| `Auth.tsx handleModulesComplete` | Accept `isTrial` param, store in state |

