
# Company Onboarding Prompt for New Subscribers

## Overview
When a new user signs up and lands on the dashboard for the first time, they should be prompted to complete their company profile setup. This ensures every subscriber becomes a proper "tenant" with their business information recorded.

## Solution Approach

We'll create an onboarding flow that:
1. Detects when a user has no company profile
2. Shows a friendly onboarding dialog prompting them to set up their business
3. Collects essential company information (name, logo, basic contact details)
4. Creates their company profile record, making them a proper tenant

## Implementation Details

### 1. Create Onboarding Dialog Component
**New file: `src/components/onboarding/CompanyOnboardingDialog.tsx`**

A modal dialog that appears for users without a company profile, featuring:
- Welcome message explaining the platform
- Essential fields only (to reduce friction):
  - Company name (required)
  - Logo upload (optional)
  - Email (optional)
  - Phone (optional)
- "Complete Setup" button that saves the profile
- Option to skip (but reminder persists until completed)

### 2. Update ProtectedRoute to Check for Company Profile
**File: `src/components/layout/ProtectedRoute.tsx`**

Extend the existing subscription check to also:
- Query if the user has a `company_profiles` record
- Pass this status to the dashboard via context or state
- No blocking - users can still access the app, but will see the prompt

### 3. Add Onboarding State to Dashboard
**File: `src/pages/Dashboard.tsx`**

- Use the `useCompanyProfile` hook to check if profile exists
- If no profile exists, show the `CompanyOnboardingDialog`
- Dialog can be dismissed but will reappear on next visit until completed

### 4. Create Onboarding Context (Optional Enhancement)
**New file: `src/contexts/OnboardingContext.tsx`**

Track onboarding completion across the app:
- `hasCompletedOnboarding` boolean
- `showOnboardingPrompt` function
- Persists dismissal state in localStorage for current session

## User Flow

```text
User signs up
     |
     v
Lands on Dashboard
     |
     v
Check: Has company_profiles record?
     |
     +---> YES --> Normal dashboard experience
     |
     +---> NO --> Show onboarding dialog
                       |
                       v
                  User fills in company name + optional details
                       |
                       v
                  Save to company_profiles table
                       |
                       v
                  Dialog closes, user is now a proper "tenant"
```

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/onboarding/CompanyOnboardingDialog.tsx` | Create | Onboarding modal with company form |
| `src/pages/Dashboard.tsx` | Modify | Add onboarding check and dialog |
| `src/hooks/useCompanyProfile.tsx` | Modify | Add `hasProfile` convenience boolean |

## Onboarding Dialog Design

The dialog will include:
- A welcoming header with the Orion Labs branding
- Brief explanation: "Let's set up your business profile"
- Minimal required fields to reduce signup friction
- Progress indicator showing this is step 1 of getting started
- Clear call-to-action button

## Technical Considerations

- **No blocking**: Users can dismiss the dialog and still use the app
- **Persistence**: Dialog reappears until profile is completed
- **Mobile-friendly**: Dialog works well on all screen sizes
- **Admin exclusion**: Super admins won't see the onboarding prompt (they manage the platform, not a business)
