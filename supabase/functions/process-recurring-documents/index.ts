import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const today = new Date().toISOString().split("T")[0];

  // Get all active recurring docs due today or earlier
  const { data: dueRecurrings, error: fetchErr } = await supabase
    .from("recurring_documents")
    .select("*")
    .eq("is_active", true)
    .lte("next_run_date", today);

  if (fetchErr) {
    console.error("Error fetching recurring documents:", fetchErr);
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let processed = 0;

  for (const rec of dueRecurrings || []) {
    try {
      if (rec.source_type === "invoice") {
        await processInvoice(supabase, rec);
      } else if (rec.source_type === "quote") {
        await processQuote(supabase, rec);
      }
      processed++;
    } catch (err) {
      console.error(`Error processing recurring doc ${rec.id}:`, err);
    }
  }

  return new Response(
    JSON.stringify({ processed, total: (dueRecurrings || []).length }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});

function advanceDate(
  frequency: string,
  from: string
): string {
  const d = new Date(from);
  switch (frequency) {
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split("T")[0];
}

async function generateNextNumber(
  supabase: any,
  table: string,
  column: string,
  prefix: string
): Promise<string> {
  const { data } = await supabase
    .from(table)
    .select(column)
    .order("created_at", { ascending: false })
    .limit(1);

  let lastNum = 0;
  if (data && data.length > 0) {
    const match = data[0][column].match(new RegExp(`${prefix}-(\\d+)`));
    if (match) lastNum = parseInt(match[1], 10);
  }
  return `${prefix}-${String(lastNum + 1).padStart(4, "0")}`;
}

async function processInvoice(supabase: any, rec: any) {
  // Fetch source invoice
  const { data: source, error: srcErr } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", rec.source_id)
    .single();

  if (srcErr || !source) throw new Error("Source invoice not found");

  // Fetch line items
  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", rec.source_id);

  // Calculate date offset (due_date - date) to preserve same offset
  const origDate = new Date(source.date);
  const origDue = new Date(source.due_date);
  const offsetDays = Math.round(
    (origDue.getTime() - origDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const newDate = new Date().toISOString().split("T")[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + offsetDays);

  const invoiceNumber = await generateNextNumber(
    supabase,
    "invoices",
    "invoice_number",
    "INV"
  );

  const { data: newInvoice, error: insertErr } = await supabase
    .from("invoices")
    .insert({
      user_id: rec.user_id,
      invoice_number: invoiceNumber,
      client_id: source.client_id,
      client_name: source.client_name,
      client_address: source.client_address,
      date: newDate,
      due_date: dueDate.toISOString().split("T")[0],
      description: source.description,
      total: source.total,
      tax_rate: source.tax_rate,
      status: "draft",
      purchase_order_number: source.purchase_order_number,
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  // Copy line items
  if (lineItems && lineItems.length > 0) {
    await supabase.from("invoice_line_items").insert(
      lineItems.map((li: any) => ({
        invoice_id: newInvoice.id,
        description: li.description,
        quantity: li.quantity,
        unit_price: li.unit_price,
        cost_price: li.cost_price || 0,
      }))
    );
  }

  // Update recurring doc
  await supabase
    .from("recurring_documents")
    .update({
      next_run_date: advanceDate(rec.frequency, rec.next_run_date),
      last_generated_at: new Date().toISOString(),
    })
    .eq("id", rec.id);
}

async function processQuote(supabase: any, rec: any) {
  const { data: source, error: srcErr } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", rec.source_id)
    .single();

  if (srcErr || !source) throw new Error("Source quote not found");

  const { data: lineItems } = await supabase
    .from("quote_line_items")
    .select("*")
    .eq("quote_id", rec.source_id);

  const origDate = new Date(source.date);
  const origValid = new Date(source.valid_until);
  const offsetDays = Math.round(
    (origValid.getTime() - origDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const newDate = new Date().toISOString().split("T")[0];
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + offsetDays);

  const quoteNumber = await generateNextNumber(
    supabase,
    "quotes",
    "quote_number",
    "QT"
  );

  const { data: newQuote, error: insertErr } = await supabase
    .from("quotes")
    .insert({
      user_id: rec.user_id,
      quote_number: quoteNumber,
      client_id: source.client_id,
      client_name: source.client_name,
      date: newDate,
      valid_until: validUntil.toISOString().split("T")[0],
      description: source.description,
      total: source.total,
      tax_rate: source.tax_rate,
      status: "draft",
      terms_and_conditions: source.terms_and_conditions,
      lead_time: source.lead_time,
      notes: source.notes,
    })
    .select()
    .single();

  if (insertErr) throw insertErr;

  if (lineItems && lineItems.length > 0) {
    await supabase.from("quote_line_items").insert(
      lineItems.map((li: any) => ({
        quote_id: newQuote.id,
        description: li.description,
        quantity: li.quantity,
        unit_price: li.unit_price,
        cost_price: li.cost_price || 0,
      }))
    );
  }

  await supabase
    .from("recurring_documents")
    .update({
      next_run_date: advanceDate(rec.frequency, rec.next_run_date),
      last_generated_at: new Date().toISOString(),
    })
    .eq("id", rec.id);
}
