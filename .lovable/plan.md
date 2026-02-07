

# Add 10 Distinct Document Layout Templates

## Overview

Currently, your documents (quotes, invoices, delivery notes) all use the same basic layout -- only the colors and fonts change between the 5 existing templates. This plan introduces 10 truly distinct layout designs with different visual structures, so each business can look unique while handling the same information.

## What Changes

### 1. Expand to 10 Unique Templates

Each template will have its own visual identity, not just different colors but different structural layouts:

| # | Template Name | Layout Style | Key Visual Feature |
|---|--------------|-------------|-------------------|
| 1 | Navy Professional | Classic top-aligned header | Company info left, logo right, traditional look |
| 2 | Emerald Modern | Centered header with accent bar | Full-width color banner, centered company name |
| 3 | Slate Minimal | Ultra-clean with lots of whitespace | Thin accent lines, minimal borders |
| 4 | Royal Blue | Split header with sidebar accent | Colored sidebar strip on the left edge |
| 5 | Burgundy Classic | Elegant with decorative borders | Double-line borders, serif typography |
| 6 | Teal Corporate | Two-column header layout | Logo and company info side-by-side in a card |
| 7 | Charcoal Bold | Dark header with white text overlay | Large bold document title in header band |
| 8 | Sunset Warm | Gradient header accent | Warm tones with a subtle gradient bar |
| 9 | Forest Executive | Boxed sections with rounded corners | Each section in a distinct rounded box |
| 10 | Midnight Contrast | High-contrast with accent highlights | Dark theme with bright accent color pops |

### 2. Make Template Selector Available Everywhere

Currently only the Quotes page has a template picker. This will be extended so:
- **Invoices** get the same template selector popover in their toolbar
- **Delivery Notes** get the same template selector
- All documents respect the chosen template's layout

### 3. Layout Rendering System

Instead of just swapping colors, a new layout rendering approach will generate different HTML structures based on the template's `headerStyle` property (which currently exists but is unused). This will be expanded to support the 10 layout variations.

## How It Works for Users

1. Go to **Settings** and pick a default template from 10 options (with live preview)
2. When viewing any document (quote, invoice, delivery note), click the **Template** button to switch layouts on the fly
3. Each template produces a visually distinct PDF when downloaded
4. The selected template in Settings becomes the default for all new documents

## Files to Change

| File | Change |
|------|--------|
| `src/components/quotes/DocumentTemplates.tsx` | Add 5 new templates (total 10), add `layoutId` property, update `TemplateSelector` grid to handle 10 items (2 rows of 5) |
| `src/components/quotes/QuotePreview.tsx` | Refactor document body to use layout-specific rendering for header, client info, and table sections |
| `src/components/invoices/InvoicePreview.tsx` | Add template selector popover (like quotes have), use layout-specific rendering instead of hardcoded layout |
| `src/components/delivery-notes/DeliveryNotePreview.tsx` | Add template selector popover, use layout-specific rendering |
| `src/components/settings/TemplateEditor.tsx` | Update preset list to 10 templates, improve preview to reflect layout differences |
| `src/components/workshop/JobCardPreview.tsx` | Add template selector support for job cards |

## Technical Details

### New Template Properties

The `DocumentTemplate` interface will be extended with a `layoutId` field that determines the structural layout:

```
interface DocumentTemplate {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'classic' | 'modern' | 'minimal' | 'centered' | 'sidebar' | 'elegant' | 'split' | 'bold-banner' | 'gradient' | 'boxed' | 'contrast';
  tableStyle: 'striped' | 'bordered' | 'clean';
}
```

### Layout-Specific Rendering

A shared helper component/function will render different header and table sections based on the template's `headerStyle`. For example:
- **"sidebar"** layout places a colored vertical bar on the left with document title rotated
- **"centered"** layout centers the company name in a full-width banner
- **"bold-banner"** layout uses a large dark header block with the document title in oversized text
- **"boxed"** layout wraps each section (header, client info, items, totals) in rounded bordered cards

### Shared Document Layout Component

To avoid code duplication across QuotePreview, InvoicePreview, and DeliveryNotePreview, shared layout rendering functions will be extracted into a new helper file (`src/components/quotes/DocumentLayoutRenderer.tsx`). Each preview component will call this renderer with its specific data, and the renderer will output the correct HTML structure based on the selected template.

### Database

No database changes needed. The existing `company_profiles` table already stores template settings (colors, font, header style, table style). The `headerStyle` field will now hold one of the expanded layout values.

### Template Selector Grid

The selector UI will be updated to show 2 rows of 5 templates, with a small preview thumbnail for each showing the layout structure (not just a color swatch).

