

## Phone Input with Country Code Dropdown

Create a reusable `PhoneInput` component with a country code selector dropdown, then apply it across all phone input fields in the application. The component will store numbers in E.164 format (e.g., `+26658001234`) which is required for SMS delivery via Africa's Talking.

---

### 1. Create Reusable `PhoneInput` Component

**New file:** `src/components/ui/phone-input.tsx`

A composite input with:
- A dropdown button on the left showing the selected country flag emoji and dial code
- A text input for the local number
- Stores the full E.164 number (no spaces) as the value -- ready for SMS APIs
- Default country: Lesotho (+266) since that's the primary market
- Includes ~15 relevant African + common countries:
  - Lesotho (+266), South Africa (+27), Botswana (+267), Eswatini (+268), Mozambique (+258), Namibia (+264), Zimbabwe (+263), Zambia (+260), Kenya (+254), Nigeria (+234), Ghana (+233), Tanzania (+255), Uganda (+256), United Kingdom (+44), United States (+1)
- Uses Popover from existing UI components for the dropdown (no new dependencies)
- Searchable country list inside the dropdown
- Auto-formats display as user types (e.g., `5800 1234`) but stores as `+26658001234`

### 2. Update Auth Signup Form

**File:** `src/pages/Auth.tsx` (lines 480-493)

Replace the plain phone `Input` with the new `PhoneInput` component. The value will be stored in E.164 format in `user_metadata.phone`, making it directly usable by the SMS edge function.

### 3. Update Other Phone Inputs

Apply `PhoneInput` to all phone fields across the app:

- `src/components/crm/AddClientDialog.tsx` -- Client phone field
- `src/pages/Clients.tsx` -- New client and edit client phone fields
- `src/components/leads/AddLeadDialog.tsx` -- Lead phone field
- `src/components/staff/AddStaffDialog.tsx` -- Staff phone field
- `src/components/onboarding/CompanyOnboardingDialog.tsx` -- Company phone field
- `src/pages/Settings.tsx` -- Company profile phone field
- `src/components/fleet/AddVehicleDialog.tsx` -- If it has a phone field for driver contact

### 4. Component API

```text
Props:
  value: string          -- E.164 formatted number (e.g. "+26658001234")
  onChange: (value: string) => void
  placeholder?: string   -- Default: "5800 1234"
  defaultCountry?: string -- ISO code, default: "LS"
  className?: string
  disabled?: boolean
```

The component handles:
- Parsing an existing E.164 value to detect the country and local number
- Combining selected country code + local digits into E.164 on every change
- Stripping spaces/dashes before storing

### Technical Details

**Files to create:**
- `src/components/ui/phone-input.tsx`

**Files to modify:**
- `src/pages/Auth.tsx` -- Replace phone Input with PhoneInput
- `src/components/crm/AddClientDialog.tsx` -- Replace phone Input
- `src/pages/Clients.tsx` -- Replace phone Inputs (new + edit forms)
- `src/components/leads/AddLeadDialog.tsx` -- Replace phone Input
- `src/components/staff/AddStaffDialog.tsx` -- Replace phone Input
- `src/components/onboarding/CompanyOnboardingDialog.tsx` -- Replace phone Input
- `src/pages/Settings.tsx` -- Replace phone Input

**No new dependencies required** -- uses existing Popover, Button, Input, and ScrollArea components.

**SMS compatibility:** The E.164 format output (e.g., `+26658001234`) is exactly what Africa's Talking expects, so existing SMS functions will work without modification.
