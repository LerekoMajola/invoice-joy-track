-- Re-activate business and workshop modules
UPDATE platform_modules SET is_active = true WHERE key IN ('core_crm', 'quotes', 'delivery_notes', 'tenders', 'workshop', 'profitability');