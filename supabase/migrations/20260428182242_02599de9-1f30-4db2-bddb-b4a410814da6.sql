ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS invoice_prefix text NOT NULL DEFAULT 'INV-',
  ADD COLUMN IF NOT EXISTS invoice_next_number integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS invoice_padding integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS quote_prefix text NOT NULL DEFAULT 'QT-',
  ADD COLUMN IF NOT EXISTS quote_next_number integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS quote_padding integer NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS delivery_note_prefix text NOT NULL DEFAULT 'DN-',
  ADD COLUMN IF NOT EXISTS delivery_note_next_number integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS delivery_note_padding integer NOT NULL DEFAULT 4;

UPDATE public.company_profiles cp
SET invoice_next_number = COALESCE(sub.max_num, 0) + 1
FROM (
  SELECT user_id,
         MAX(NULLIF(regexp_replace(invoice_number, '\D', '', 'g'), '')::int) AS max_num
  FROM public.invoices
  GROUP BY user_id
) sub
WHERE sub.user_id = cp.user_id AND COALESCE(sub.max_num, 0) >= 1;

UPDATE public.company_profiles cp
SET quote_next_number = COALESCE(sub.max_num, 0) + 1
FROM (
  SELECT user_id,
         MAX(NULLIF(regexp_replace(quote_number, '\D', '', 'g'), '')::int) AS max_num
  FROM public.quotes
  GROUP BY user_id
) sub
WHERE sub.user_id = cp.user_id AND COALESCE(sub.max_num, 0) >= 1;

UPDATE public.company_profiles cp
SET delivery_note_next_number = COALESCE(sub.max_num, 0) + 1
FROM (
  SELECT user_id,
         MAX(NULLIF(regexp_replace(note_number, '\D', '', 'g'), '')::int) AS max_num
  FROM public.delivery_notes
  GROUP BY user_id
) sub
WHERE sub.user_id = cp.user_id AND COALESCE(sub.max_num, 0) >= 1;

CREATE OR REPLACE FUNCTION public.reserve_document_number(
  p_company_profile_id uuid,
  p_doc_type text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prefix text;
  v_num integer;
  v_padding integer;
BEGIN
  IF p_doc_type = 'invoice' THEN
    UPDATE public.company_profiles
       SET invoice_next_number = invoice_next_number + 1
     WHERE id = p_company_profile_id
    RETURNING invoice_prefix, invoice_next_number - 1, invoice_padding
      INTO v_prefix, v_num, v_padding;
  ELSIF p_doc_type = 'quote' THEN
    UPDATE public.company_profiles
       SET quote_next_number = quote_next_number + 1
     WHERE id = p_company_profile_id
    RETURNING quote_prefix, quote_next_number - 1, quote_padding
      INTO v_prefix, v_num, v_padding;
  ELSIF p_doc_type = 'delivery_note' THEN
    UPDATE public.company_profiles
       SET delivery_note_next_number = delivery_note_next_number + 1
     WHERE id = p_company_profile_id
    RETURNING delivery_note_prefix, delivery_note_next_number - 1, delivery_note_padding
      INTO v_prefix, v_num, v_padding;
  ELSE
    RAISE EXCEPTION 'Invalid doc_type: %', p_doc_type;
  END IF;

  IF v_num IS NULL THEN
    RAISE EXCEPTION 'Company profile not found: %', p_company_profile_id;
  END IF;

  RETURN COALESCE(v_prefix, '') || lpad(v_num::text, GREATEST(v_padding, 0), '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_document_number(uuid, text) TO authenticated, service_role;