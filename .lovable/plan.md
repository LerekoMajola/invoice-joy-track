

## Fleet Management System -- Full Feature Build

This plan addresses every missing feature from your comprehensive list. The current system has 5 tabs and basic vehicle/service/fuel/cost tracking. This expansion adds **Maintenance Engine, Tyre Management, Driver Management, enhanced Incident Management, Document Management, Reporting**, and upgrades the existing tabs with missing functionality.

---

### Current State vs Required

```text
Feature Area              | Current Status      | Action Needed
--------------------------|--------------------|--------------
Vehicle CRUD + details    | Partial (no edit)   | Add EditVehicleDialog, warranty, color, fuel type, status toggle
Maintenance Engine        | MISSING             | New table + tab + scheduling logic
Tyre Management           | Table exists, no UI | New hook + tab + dialogs
Driver Management         | MISSING             | New table + hook + tab + dialogs
Incident Management       | Basic               | Add photo uploads, insurance claim ref, resolved status
Document Management       | Table exists, no UI | New hook + tab + upload dialogs
Fleet Cost Intelligence   | Basic               | Add cost-per-km, insurance/finance/licensing entries, trend chart
Vehicle Health AI         | Basic score only    | Add cost-vs-value, warranty factor, replace-or-keep panel
Alerts Center             | License/insurance   | Add service due, tyre, warranty, high-spend alerts
Reporting                 | MISSING             | New tab with PDF/Excel export
Fleet Dashboard           | Basic 4-card layout | Upgrade with alerts center, activity log
```

---

### Phase 1: Database Schema Changes

**1.1 New Tables**

**`fleet_maintenance_schedules`** -- Preventative maintenance engine
- `id`, `user_id`, `vehicle_id` (FK), `service_type` (text), `interval_km` (integer), `interval_months` (integer), `last_completed_date` (date), `last_completed_odometer` (integer), `next_due_date` (date), `next_due_odometer` (integer), `is_active` (boolean default true), `notes` (text), `created_at`
- RLS: user_id = auth.uid()

**`fleet_drivers`** -- Driver profiles with risk scoring
- `id`, `user_id`, `full_name`, `phone`, `license_number`, `license_expiry` (date), `license_type` (text), `risk_score` (integer default 100), `status` (text default 'active'), `notes` (text), `created_at`
- RLS: user_id = auth.uid()

**1.2 Schema Modifications**

**`fleet_vehicles`** -- Add columns:
- `warranty_expiry` (date, nullable)
- `color` (text, nullable)
- `fuel_type` (text, nullable, default 'diesel')
- `engine_size` (text, nullable)
- `disposed_at` (date, nullable)

**`fleet_incidents`** -- Add columns:
- `photo_urls` (text[], nullable)
- `insurance_claim_ref` (text, nullable)
- `resolved` (boolean, default false)

**`fleet_tyres`** -- Add columns:
- `cost` (numeric, default 0)
- `rotation_count` (integer, default 0)
- `last_rotation_date` (date, nullable)
- `replacement_date` (date, nullable)
- `size` (text, nullable)

**`fleet_cost_entries`** -- Add column:
- `vendor` (text, nullable)

All changes via a single database migration.

---

### Phase 2: New Hooks (4 new files)

**`useFleetMaintenanceSchedules.tsx`**
- CRUD for maintenance schedules
- Auto-calculate `next_due_date` and `next_due_odometer` based on intervals
- Return overdue/upcoming schedules

**`useFleetTyres.tsx`**
- CRUD for tyre records per vehicle
- Track rotations, replacement alerts (current_km approaching expected_km)
- Cost aggregation per vehicle

**`useFleetDrivers.tsx`**
- CRUD for driver profiles
- Risk score computation (based on linked incidents/fines)
- License expiry alerts

**`useFleetDocuments.tsx`**
- CRUD for fleet documents with file upload to `fleet-documents` storage bucket
- Filter by vehicle, document type, expiry status
- Expiry alerts for documents

**`useFleetCostEntries.tsx`**
- CRUD for the existing `fleet_cost_entries` table (insurance, finance, licensing costs)
- Category-based aggregation

---

### Phase 3: Fleet Page Restructure (8 Tabs)

Update `src/pages/Fleet.tsx` from 5 tabs to 8:

```text
Overview | Vehicles | Maintenance | Service | Fuel | Tyres | Drivers | Costs
```

On mobile, tabs will use a horizontally scrollable `TabsList`.

**3.1 New Components**

| Component | Purpose |
|-----------|---------|
| `EditVehicleDialog.tsx` | Edit all vehicle fields including new ones (warranty, color, fuel type, status changes) |
| `MaintenanceTab.tsx` | Maintenance schedules list, upcoming/overdue indicators, add schedule dialog |
| `AddMaintenanceScheduleDialog.tsx` | Create km-based or time-based maintenance schedules |
| `TyresTab.tsx` | Tyre inventory per vehicle, position tracking, rotation scheduling |
| `AddTyreDialog.tsx` | Log tyre installation with position, brand, cost, expected km |
| `DriversTab.tsx` | Driver profiles list, risk scores, license expiry tracking |
| `AddDriverDialog.tsx` | Create driver profile with license details |
| `DriverDetailDialog.tsx` | Driver details, linked incidents, vehicle assignment history |
| `FleetDocumentsTab.tsx` | Searchable document archive with upload, filter by type/vehicle |
| `AddFleetDocumentDialog.tsx` | Upload document with type, vehicle, expiry date |
| `FleetReportsTab.tsx` | Report generation with PDF export |
| `AddCostEntryDialog.tsx` | Log insurance, finance, licensing costs |

**3.2 Upgraded Existing Components**

| Component | Changes |
|-----------|---------|
| `VehicleDetailDialog.tsx` | Add Edit button, warranty info, documents tab, cost-per-km display, replace-or-keep recommendation panel |
| `CostsTab.tsx` | Add cost-per-km column, insurance/finance/licensing categories, monthly trend chart (Recharts), cost entry logging |
| `FleetOverviewTab.tsx` | Add maintenance due alerts, tyre alerts, warranty alerts, activity log section |
| `AddIncidentDialog.tsx` | Add photo upload field, insurance claim reference, resolved toggle |
| `VehicleHealthBadge.tsx` | Enhanced score algorithm including warranty status, cost-to-value ratio |

---

### Phase 4: Fleet Dashboard Enhancement

Update `src/pages/FleetDashboard.tsx` with:
- Smart Alerts Center (consolidated: service due, license, insurance, warranty, tyre, high-spend)
- Activity Log (recent service logs, fuel entries, incidents -- last 10 across all vehicles)
- Monthly cost trend mini-chart
- Link cards to relevant Fleet tabs

---

### Phase 5: Reporting

`FleetReportsTab.tsx` will include:
- Fleet Performance Summary (total vehicles, avg health, total cost)
- Cost Per Vehicle Report (table with fuel/maintenance/insurance/incident breakdown)
- Maintenance Trend Report (services per month chart)
- Incident Frequency Report
- Vehicle Replacement Forecast (vehicles with health score below 40)
- Export to PDF using existing `jspdf`/`html2canvas` utilities

---

### Technical Summary

**Database Migration:** 1 migration with 2 new tables + 3 table modifications

**New Files (16):**
- `src/hooks/useFleetMaintenanceSchedules.tsx`
- `src/hooks/useFleetTyres.tsx`
- `src/hooks/useFleetDrivers.tsx`
- `src/hooks/useFleetDocuments.tsx`
- `src/hooks/useFleetCostEntries.tsx`
- `src/components/fleet/EditVehicleDialog.tsx`
- `src/components/fleet/MaintenanceTab.tsx`
- `src/components/fleet/AddMaintenanceScheduleDialog.tsx`
- `src/components/fleet/TyresTab.tsx`
- `src/components/fleet/AddTyreDialog.tsx`
- `src/components/fleet/DriversTab.tsx`
- `src/components/fleet/AddDriverDialog.tsx`
- `src/components/fleet/DriverDetailDialog.tsx`
- `src/components/fleet/FleetDocumentsTab.tsx`
- `src/components/fleet/AddFleetDocumentDialog.tsx`
- `src/components/fleet/AddCostEntryDialog.tsx`

**Modified Files (8):**
- `src/pages/Fleet.tsx` -- 8-tab layout
- `src/pages/FleetDashboard.tsx` -- Enhanced dashboard
- `src/components/fleet/VehicleDetailDialog.tsx` -- Edit, docs, replace-or-keep
- `src/components/fleet/CostsTab.tsx` -- Cost intelligence upgrade
- `src/components/fleet/FleetOverviewTab.tsx` -- Full alerts center
- `src/components/fleet/AddIncidentDialog.tsx` -- Photos, claims
- `src/components/fleet/VehicleHealthBadge.tsx` -- Enhanced algorithm
- `src/hooks/useFleetVehicles.tsx` -- New fields support

**No new dependencies** -- uses existing Recharts, jspdf, html2canvas, and storage bucket.

