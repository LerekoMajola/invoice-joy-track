
# Update Auth Branding Panel -- Add GymPro and Make Pills Colourful

## Problem
1. The industry pills on the auth branding panel are missing **GymPro**.
2. The heading says "Seven Industries" but there are now eight.
3. The pills are plain white/transparent -- need to be colourful with icons to match the rest of the platform's vibrant style.

## Changes (1 file)

### `src/components/auth/AuthBrandingPanel.tsx`

- Import icons from lucide-react: `Briefcase`, `Wrench`, `GraduationCap`, `Scale`, `Hammer`, `Hotel`, `Car`, `Dumbbell`
- Replace the plain `industries` string array with a structured array containing label, icon, and a unique gradient/colour for each pill:

| Label | Icon | Pill Colour |
|-------|------|-------------|
| BizPro | Briefcase | `bg-indigo-500/80` |
| ShopPro | Wrench | `bg-orange-500/80` |
| EduPro | GraduationCap | `bg-cyan-500/80` |
| LawPro | Scale | `bg-emerald-500/80` |
| HirePro | Hammer | `bg-amber-500/80` |
| StayPro | Hotel | `bg-rose-500/80` |
| FleetPro | Car | `bg-slate-500/80` |
| GymPro | Dumbbell | `bg-lime-500/80` |

- Each pill will render as a colourful rounded badge with its icon + label (white text, backdrop blur)
- Update heading from "Seven Industries" to "Eight Industries"
- Update subtitle text to include GymPro in the list
