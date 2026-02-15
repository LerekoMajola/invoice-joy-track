

## Fleet Subscription Tiers -- Feature-Based Packaging

Restructure the three fleet subscription tiers so that features progressively unlock from Starter to Enterprise, matching the comprehensive feature list you provided.

---

### Tier Structure

```text
+-------------------------------+----------+--------------+------------+
| Feature                       | Starter  | Professional | Enterprise |
|                               | M500/mo  | M700/mo      | M950/mo    |
+-------------------------------+----------+--------------+------------+
| CORE SYSTEM                                                          |
+-------------------------------+----------+--------------+------------+
| Executive Dashboard           |    Y     |      Y       |     Y      |
| Fleet Overview Panel          |    Y     |      Y       |     Y      |
| Vehicle Health Indicators     |    Y     |      Y       |     Y      |
| Activity Log                  |    Y     |      Y       |     Y      |
| Smart Alerts Center           |    -     |      Y       |     Y      |
| Role-Based Access             |    -     |      -       |     Y      |
+-------------------------------+----------+--------------+------------+
| VEHICLE MANAGEMENT                                                   |
+-------------------------------+----------+--------------+------------+
| Add/Edit Vehicles             |    Y     |      Y       |     Y      |
| Digital Vehicle File          |    Y     |      Y       |     Y      |
| License & Insurance Tracking  |    Y     |      Y       |     Y      |
| Odometer & Driver Assignment  |    Y     |      Y       |     Y      |
| Warranty Tracking             |    -     |      Y       |     Y      |
+-------------------------------+----------+--------------+------------+
| MAINTENANCE & REPAIRS                                                |
+-------------------------------+----------+--------------+------------+
| Service History & Logging     |    Y     |      Y       |     Y      |
| Fuel Cost Entry               |    Y     |      Y       |     Y      |
| Maintenance Scheduling        |    -     |      Y       |     Y      |
| Preventative Maintenance      |    -     |      Y       |     Y      |
| Parts & Provider Tracking     |    -     |      Y       |     Y      |
+-------------------------------+----------+--------------+------------+
| COST INTELLIGENCE                                                    |
+-------------------------------+----------+--------------+------------+
| Total Cost Per Vehicle        |    -     |      Y       |     Y      |
| Cost Per KM Calculation       |    -     |      Y       |     Y      |
| Monthly Fleet Cost Dashboard  |    -     |      Y       |     Y      |
| High-Cost Vehicle Alerts      |    -     |      Y       |     Y      |
| Accounting Integration        |    -     |      Y       |     Y      |
+-------------------------------+----------+--------------+------------+
| ADVANCED (ENTERPRISE)                                                |
+-------------------------------+----------+--------------+------------+
| Vehicle Health AI Score       |    -     |      -       |     Y      |
| Replace-or-Keep Predictor     |    -     |      -       |     Y      |
| Tyre Lifecycle Manager        |    -     |      -       |     Y      |
| Driver Risk Scoring           |    -     |      -       |     Y      |
| Incident & Claims Management  |    -     |      -       |     Y      |
| Fleet Reporting (PDF/Excel)   |    -     |      -       |     Y      |
| Document Archive              |    -     |      -       |     Y      |
| Multi-Branch Support          |    -     |      -       |     Y      |
+-------------------------------+----------+--------------+------------+
```

---

### What Changes

**1. Update `PackageTierSelector.tsx`**

Replace the current 6-feature fleet tiers with the full feature list (12-14 features per tier) showing clear progression:

- **Starter (M500)**: Vehicle registry, service logs, fuel logs, dashboard, health indicators, staff, invoices, tasks
- **Professional (M700)**: Everything in Starter + maintenance engine, cost intelligence, accounting, alerts, warranty tracking
- **Enterprise (M950)**: Everything in Professional + Health AI, replace-or-keep predictor, tyre management, driver risk scoring, incident management, reporting, document archive, multi-branch, CRM

Module keys will also be updated per tier to gate access in the navigation/UI.

**2. Update `PackageTier` interface**

The existing interface already supports this -- just updating the `features` array and `moduleKeys` array for each tier. No structural changes needed.

**3. Feature display**

Each tier card will show ~14 feature rows with checkmarks and dashes, making the value progression immediately clear to buyers. The "Most Popular" badge stays on Professional.

---

### Technical Details

**Files to modify:**
- `src/components/auth/PackageTierSelector.tsx` -- Replace the `fleetTiers` array (lines 320-364) with the expanded feature-based tiers

**Module key mapping per tier:**
- Starter: `['fleet', 'invoices', 'tasks', 'staff']`
- Professional: `['fleet', 'fleet_maintenance', 'fleet_costs', 'invoices', 'tasks', 'staff', 'accounting']`
- Enterprise: `['fleet', 'fleet_maintenance', 'fleet_costs', 'fleet_tyres', 'fleet_drivers', 'fleet_reports', 'fleet_documents', 'invoices', 'tasks', 'staff', 'accounting', 'core_crm']`

No database changes required -- this is purely a pricing/packaging UI update. The module keys will be used for future feature gating as those features are built out in subsequent phases.

