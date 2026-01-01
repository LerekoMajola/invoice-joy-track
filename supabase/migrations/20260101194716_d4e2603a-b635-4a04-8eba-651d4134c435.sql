-- Add cost_price column to quote_line_items for tracking supplier costs
ALTER TABLE quote_line_items 
ADD COLUMN cost_price numeric DEFAULT 0;

-- Add cost_price column to invoice_line_items for tracking supplier costs
ALTER TABLE invoice_line_items 
ADD COLUMN cost_price numeric DEFAULT 0;