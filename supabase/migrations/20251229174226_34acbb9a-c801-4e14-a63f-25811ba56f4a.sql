-- Add template customization fields to company_profiles table
ALTER TABLE public.company_profiles
ADD COLUMN template_primary_color TEXT DEFAULT 'hsl(230, 35%, 18%)',
ADD COLUMN template_secondary_color TEXT DEFAULT 'hsl(230, 25%, 95%)',
ADD COLUMN template_accent_color TEXT DEFAULT 'hsl(230, 35%, 25%)',
ADD COLUMN template_font_family TEXT DEFAULT 'DM Sans',
ADD COLUMN template_font_url TEXT DEFAULT NULL,
ADD COLUMN template_header_style TEXT DEFAULT 'classic',
ADD COLUMN template_table_style TEXT DEFAULT 'striped';