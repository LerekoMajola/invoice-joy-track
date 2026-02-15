

## Fleet Management Module -- Orion Labs Integration

Build Fleet Management as a native module within the existing Orion Labs platform, following the same patterns used by Workshop, Hire, Legal, and other modules. The fleet module already exists in the platform_modules table (key: `fleet`, currently `is_active: false`).

This is Phase 1 covering the foundation: database tables, vehicle registry, fleet dashboard stats, service/fuel logging, and navigation integration.

---

### 1. Database Migration

Create 7 tables, all with `user_id` column and RLS policies matching existing patterns:

- **fleet_vehicles** -- Vehicle registry (make, model, year, vin, license_plate, license_expiry, insurance_expiry, odometer, assigned_driver, purchase_price, finance_details, status, health_score)
- **fleet_service_logs** -- Service/repair records (vehicle_id, service_date, service_type, provider, cost, parts_replaced, invoice_url, notes)
- **fleet_fuel_logs** -- Manual fuel entries (vehicle_id, date, litres, cost, odometer)
- **fleet_incidents** -- Driver incidents/fines/accidents (vehicle_id, driver_name, incident_type, date, cost, description, severity)
- **fleet_tyres** -- Tyre lifecycle tracking (vehicle_id, position, brand, date_fitted, expected_km, current_km, status)
- **fleet_documents** -- Per-vehicle document uploads (vehicle_id, document_type, file_url, expiry_date, notes)
- **fleet_cost_entries** -- Unified cost tracking (vehicle_id, category, amount, date, reference)

Also:
- Create a `fleet-documents` storage bucket
- Activate the existing fleet module: `UPDATE platform_modules SET is_active = true WHERE key = 'fleet'`

### 2. Navigation Integration

Add Fleet nav item to all three navigation components, gated by `moduleKey: 'fleet'` and `systemTypes: null` (available to all system types as a shared module):

- **Sidebar** -- Add `{ name: 'Fleet', href: '/fleet', icon: Car, moduleKey: 'fleet', systemTypes: null }` in the shared section
- **BottomNav** -- Not added to bottom bar (too many items); accessible via More menu
- **MoreMenuSheet** -- Add `{ icon: Car, label: 'Fleet', path: '/fleet', description: 'Vehicle management', moduleKey: 'fleet', systemTypes: null }`
- **App.tsx** -- Add `/fleet` route

### 3. Hooks (following existing patterns like useJobCards)

- **useFleetVehicles** -- CRUD for vehicles with health score computation
- **useFleetServiceLogs** -- Service history per vehicle
- **useFleetFuelLogs** -- Fuel log entries
- **useFleetCosts** -- Aggregated cost per vehicle
- **useFleetIncidents** -- Incident logging

### 4. Fleet Page (`/fleet`) -- Rewrite existing placeholder

Tabbed layout matching Workshop/Accounting pages:
- **Overview Tab** -- Stat cards (total vehicles, active/inactive, needing service, monthly cost), vehicle health summary with color-coded badges, upcoming alerts (expiring licenses/insurance, service due)
- **Vehicles Tab** -- Vehicle list with health indicators, Add Vehicle dialog, Vehicle detail dialog (digital file showing service history, costs, documents)
- **Service Log Tab** -- Log and view service/repair records with cost tracking
- **Fuel Log Tab** -- Manual fuel entry and consumption overview
- **Costs Tab** -- Cost intelligence view showing true cost per vehicle with trend indicators

### 5. Vehicle Health Score (client-side computed)

Score 0-100 based on:
- Age penalty (vehicles older than 10 years lose points)
- Mileage penalty (high odometer = lower score)
- Repair frequency (more repairs in last 12 months = lower)
- Cost trend (rising monthly costs = lower)

Visual badges:
- 70-100: "Healthy" (green)
- 40-69: "Monitor" (amber)
- 0-39: "Replace Soon" (red)

### 6. Components

New files under `src/components/fleet/`:
- `FleetOverviewTab.tsx` -- Dashboard stats and alerts
- `VehiclesTab.tsx` -- Vehicle list and management
- `AddVehicleDialog.tsx` -- Form for adding vehicles
- `VehicleDetailDialog.tsx` -- Full vehicle digital file
- `VehicleHealthBadge.tsx` -- Color-coded health indicator
- `FleetStatsCards.tsx` -- Stat cards for overview
- `ServiceLogTab.tsx` -- Service history tab
- `FuelLogTab.tsx` -- Fuel logging tab
- `CostsTab.tsx` -- Cost intelligence view
- `AddServiceLogDialog.tsx` -- Log a service
- `AddFuelLogDialog.tsx` -- Log fuel
- `AddIncidentDialog.tsx` -- Log an incident

### Technical Details

**Files to create:**
- `supabase/migrations/[timestamp]_fleet_tables.sql`
- `src/hooks/useFleetVehicles.tsx`
- `src/hooks/useFleetServiceLogs.tsx`
- `src/hooks/useFleetFuelLogs.tsx`
- `src/hooks/useFleetCosts.tsx`
- `src/hooks/useFleetIncidents.tsx`
- `src/pages/Fleet.tsx` (rewrite)
- 12 component files under `src/components/fleet/`

**Files to modify:**
- `src/App.tsx` -- Already has Fleet route, verify it works
- `src/components/layout/Sidebar.tsx` -- Add Fleet nav item
- `src/components/layout/MoreMenuSheet.tsx` -- Add Fleet menu item
- `src/components/layout/BottomNav.tsx` -- Add `/fleet` to moreRoutes array

**UI Direction:**
- Uses existing DashboardLayout, Header, StatCard, Card components
- Same styling patterns as Workshop and Accounting pages
- Health badges use existing Badge component with color variants
- Currency formatting uses existing `formatMaluti()` utility
- All dialogs use existing Dialog/Sheet components

