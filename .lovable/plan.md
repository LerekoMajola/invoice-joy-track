

# Fix: "Sign up" Link Skips System Selection

## Problem
When a user clicks "Don't have an account? Sign up" on the login form, they are sent directly to the package selection step (skipping system selection). Since no system has been chosen, `selectedSystem` is `null`, and the PackageTierSelector falls back to showing School tiers.

## Root Cause
In `src/pages/Auth.tsx`, line 588:
```
onClick={() => { setIsLogin(false); setSignupStep('package'); }}
```
This should be `setSignupStep('system')` so users first choose Business, Workshop, or School.

## Fix
**File:** `src/pages/Auth.tsx` (line 588)

Change `setSignupStep('package')` to `setSignupStep('system')` in the "Don't have an account? Sign up" button handler.

This single-line fix ensures:
- Users who click "Sign up" from the login form see the system selector first
- Users arriving via `/auth?system=business` (from the landing page) still skip directly to package selection as intended
- The flow remains: System Selection -> Package Tier -> Review -> Credentials

