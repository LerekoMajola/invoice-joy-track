

## Equipment Catalogue Enhancements

### 1. Update Equipment Catalogue Module Price
The "Equipment Catalogue" module subscription cost will be updated to **M140.00**/month in the database.

### 2. Add Equipment Service Logs
A new database table `equipment_service_logs` will track maintenance and service history per item:
- Service date, type (repair, calibration, inspection)
- Provider name, cost, parts replaced, notes

### 3. Add Equipment Incidents
A new database table `equipment_incidents` will log damage, breakdowns, and other events:
- Incident date, type (damage, breakdown, theft, loss)
- Severity (minor, moderate, major), description, cost
- Resolution status and photo evidence

### 4. Equipment Detail Dialog
Clicking an equipment card will open a detail dialog with three tabs:
- **Overview**: Full equipment info
- **Services**: Service log history with "Add Service" button
- **Incidents**: Incident history with "Add Incident" button

### 5. Currency Display Fix
The Equipment page will use the dynamic currency hook (`useCurrency`) instead of `formatMaluti()` so it respects each company's chosen currency.

---

### Technical Details

**Data update (module price):**
```sql
UPDATE platform_modules SET monthly_price = 140 WHERE key = 'hire_equipment';
```

**New database tables:**

```sql
-- equipment_service_logs
CREATE TABLE public.equipment_service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  equipment_item_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES company_profiles(id),
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  service_type TEXT NOT NULL DEFAULT 'repair',
  provider TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  parts_replaced TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- equipment_incidents
CREATE TABLE public.equipment_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  equipment_item_id UUID NOT NULL REFERENCES equipment_items(id) ON DELETE CASCADE,
  company_profile_id UUID REFERENCES company_profiles(id),
  incident_type TEXT NOT NULL DEFAULT 'damage',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  severity TEXT NOT NULL DEFAULT 'minor',
  description TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  resolved BOOLEAN NOT NULL DEFAULT false,
  photo_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Both tables get RLS policies restricting access to the owner (`user_id = auth.uid()`).

**New files:**
- `src/hooks/useEquipmentServices.tsx` -- CRUD hook for service logs
- `src/hooks/useEquipmentIncidents.tsx` -- CRUD hook for incidents
- `src/components/hire/EquipmentDetailDialog.tsx` -- tabbed detail view
- `src/components/hire/AddEquipmentServiceDialog.tsx` -- add service form
- `src/components/hire/AddEquipmentIncidentDialog.tsx` -- add incident form

**Modified files:**
- `src/pages/Equipment.tsx` -- use `useCurrency` instead of `formatMaluti`, open detail dialog on card click

