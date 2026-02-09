

# Add Date and Motivational Message to Business Dashboard

## Overview
Display the current date and a rotating business-themed motivational message on the Business Dashboard, creating a welcoming daily greeting for users.

## What Changes

### File: `src/pages/BusinessDashboard.tsx`

1. **Date Display**: Show the current date formatted nicely (e.g., "Sunday, 9 February 2026") below the header.

2. **Message of the Day**: Display a rotating motivational business quote that changes daily. Examples:
   - "Success is not final, failure is not fatal — it is the courage to continue that counts."
   - "Every client interaction is an opportunity to build something great."
   - "Small daily improvements lead to stunning long-term results."
   - "Your hustle today is your empire tomorrow."
   - ~15-20 quotes total, selected based on the day of the year so the same quote shows all day.

3. **Layout**: A styled card or banner between the Header and the Stats grid, showing:
   - The formatted date on one line
   - The motivational message below it, styled in italic or accent text

## Technical Details

- Use `date-fns` (already installed) for date formatting
- Quote selection: `quotes[dayOfYear % quotes.length]` ensures daily rotation without randomness
- No database or API needed — quotes are hardcoded in the component
- Single file change only

