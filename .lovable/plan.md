

## Update GymPro Package Tiers

Modify the three GymPro tiers in the `package_tiers` table with the following changes (pricing unchanged):

### GymPro Starter (M500/mo)
- Remove **Task Management** (feature + module key)
- Remove **Staff & HR** (feature + module key)

### GymPro Professional (M700/mo)
- Remove **Task Management** (feature + module key)
- Remove **Accounting** (feature + module key)

### GymPro Enterprise (M950/mo)
- Add **Multi-Branch** (feature, marked as included)
- Add **Custom Branding** (feature, marked as included)

### Technical Details

Three `UPDATE` statements against the `package_tiers` table to adjust `features` (JSON array) and `module_keys` (text array) for each tier by ID. No schema changes or code changes are needed -- the frontend already reads these values dynamically from the database.

| Tier | Removed Features | Removed Module Keys | Added Features |
|------|-----------------|---------------------|---------------|
| Starter | Task Management, Staff & HR | tasks, staff | -- |
| Professional | Task Management, Accounting | tasks, accounting | -- |
| Enterprise | -- | -- | Multi-Branch, Custom Branding |

