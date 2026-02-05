

# Dashboard Component Reordering

Reorganize dashboard components to follow a logical "Glance → Action → Reference" pattern for optimal user experience.

---

## Current Order vs Proposed Order

| Current Position | Component | Proposed Position |
|------------------|-----------|-------------------|
| 1 | To-Do List | 2 |
| 2 | Tender Source Links | 6 |
| 3 | Stats Grid | 1 |
| 4 | Leads Pipeline | 4 |
| 5 | Company Documents | 5 |
| 6 | Tenders List | 3 |

---

## New Logical Order

1. **Stats Grid (KPIs)** - First thing users see: revenue, quotes, invoices, clients
2. **To-Do List** - Immediate actions needed today
3. **Active Tenders** - Time-sensitive opportunities with deadlines
4. **Leads Pipeline** - Sales funnel progress overview
5. **Company Documents** - Reference materials (certificates, compliance)
6. **Tender Source Links** - External resources for finding new tenders

---

## Rationale

- **Stats first**: Users want to know business health at a glance
- **Tasks second**: What needs doing today
- **Tenders third**: Time-bound opportunities that need attention
- **Pipeline fourth**: Sales progress (less urgent than tenders)
- **Documents/Links last**: Reference content accessed occasionally

---

## File to Modify

`src/pages/Dashboard.tsx` - Reorder the JSX components within the main content div

---

## Implementation

Simply rearrange the component order in the return statement:

```text
<div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-safe">
  {/* 1. Stats Grid - Business health at a glance */}
  <StatsGrid />
  
  {/* 2. To-Do List - Immediate actions */}
  <DashboardTodoList />
  
  {/* 3. Active Tenders - Time-sensitive opportunities */}
  <TendersList />
  
  {/* 4. Leads Pipeline - Sales progress */}
  <LeadsPipeline />
  
  {/* 5. Company Documents - Reference */}
  <CompanyDocuments />
  
  {/* 6. Tender Source Links - External resources */}
  <TenderSourceLinks />
</div>
```

This is a simple reordering change with no logic modifications required.

