
# Upgrade Owner Account to Permanent Pro

## What Will Change
Update the subscription for user `89710bb3-dff7-4e5e-9af0-7ef7f3ad105d` (the Orion Labs owner/admin) to a permanent Pro plan.

## Database Update
Run a single SQL update on the `subscriptions` table:
- **plan**: `free_trial` --> `pro`
- **status**: `trialing` --> `active`
- **trial_ends_at**: cleared (set to NULL -- no trial)
- **current_period_end**: set to `2099-12-31` (effectively forever)
- **payment_method**: `owner`
- **payment_reference**: `OWNER-PERPETUAL`

No code changes, no schema changes. Just a one-time data update to your existing subscription row.
