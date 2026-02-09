

# Add Company Profile Card at Top of Settings

## Problem
To be a "full tenant," a user needs a `company_profiles` record with at minimum a company name. Currently the Settings page doesn't have a dedicated section for basic company identity fields -- they're only captured during onboarding (name, email, phone) and everything else relies on a free-text "Document Header" textarea. This makes it unclear what information is needed.

## Solution
Add a new "Company Profile" card as the **first card** on the Settings page (above Change Password), containing all the core identity fields that make a user a proper tenant in the system.

### Company Profile Card Fields

| Field | Maps To |
|-------|---------|
| Company / Firm Name * | `company_name` |
| Email | `email` |
| Phone | `phone` |
| Website | `website` |
| Address Line 1 | `address_line_1` |
| Address Line 2 | `address_line_2` |
| City | `city` |
| Postal Code | `postal_code` |
| Country | `country` |
| Registration Number | `registration_number` |
| VAT Number | `vat_number` |

These fields already exist in the `company_profiles` table but are currently never shown as individual inputs on the Settings page.

### Layout
- The card uses the `Building2` icon and is titled "Company Profile" with subtitle "Your business identity -- this information is required for full platform access"
- Fields are arranged in a responsive 2-column grid (single column on mobile)
- Company Name is marked as required with an asterisk
- The label adapts based on `systemType`: "Firm Name" for legal, "School Name" for school, "Workshop Name" for workshop, "Company Name" for business

### No Database Changes
All columns already exist in `company_profiles`. This is purely a UI change.

## Technical Details

### File Modified

| File | Change |
|------|--------|
| `src/pages/Settings.tsx` | Add new "Company Profile" card as the first section, import `useSubscription` for system type label, add the identity fields bound to existing `formData` state |

The form fields are already tracked in `formData` state (lines 37-71) with keys like `company_name`, `email`, `phone`, `address_line_1`, etc. -- they just need to be rendered as inputs. The existing `handleChange` and `handleSave` functions will handle persistence without modification.

