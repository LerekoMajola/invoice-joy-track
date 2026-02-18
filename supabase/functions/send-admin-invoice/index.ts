import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { invoiceId, recipientEmail, pdfBase64, pdfFilename } = await req.json();
    if (!invoiceId) {
      return new Response(JSON.stringify({ error: "Missing invoiceId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invoice, error: invError } = await supabase
      .from("admin_invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sendTo = recipientEmail || invoice.tenant_email;
    if (!sendTo) {
      return new Response(JSON.stringify({ error: "No recipient email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];
    const taxAmount = invoice.subtotal * (invoice.tax_rate / 100);
    const subscriptionRef = `REF-${invoice.tenant_user_id.slice(0, 8).toUpperCase()}`;

    const itemsHtml = lineItems
      .map(
        (item: any, i: number) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;color:#888;width:30px">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.description}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">M${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">M${(item.quantity * item.unit_price).toFixed(2)}</td>
      </tr>`
      )
      .join("");

    const issueDate = new Date(invoice.issue_date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const dueDate = new Date(invoice.due_date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const logoUrl = "https://invoice-joy-track.lovable.app/pwa-192x192.png";

    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
      <div style="background:#1a1a2e;color:white;padding:24px;border-radius:8px 8px 0 0">
        <table style="width:100%"><tr>
          <td style="vertical-align:middle">
            <img src="${logoUrl}" alt="Orion Labs" style="height:48px;width:48px;border-radius:8px;margin-right:12px" />
          </td>
          <td style="vertical-align:middle;width:100%">
            <h1 style="margin:0;font-size:24px">Orion Labs</h1>
            <p style="margin:4px 0 0;opacity:0.8;font-size:14px">Pioneer Mall, Maseru, Lesotho</p>
            <p style="margin:2px 0 0;opacity:0.7;font-size:13px">sales@orionlabslesotho.com</p>
          </td>
        </tr></table>
      </div>
      <div style="padding:24px;border:1px solid #eee;border-top:none">
        <div style="display:flex;justify-content:space-between;margin-bottom:24px">
          <div>
            <p style="color:#888;font-size:12px;margin:0">INVOICE</p>
            <p style="font-size:20px;font-weight:bold;margin:4px 0">${invoice.invoice_number}</p>
          </div>
        </div>
        <div style="margin-bottom:24px">
          <p style="color:#888;font-size:12px;margin:0 0 4px">Bill To</p>
          <p style="font-weight:bold;margin:0">${invoice.company_name}</p>
          <p style="margin:2px 0;color:#666">${invoice.tenant_email}</p>
        </div>
        <div style="margin-bottom:16px;font-size:14px">
          <p style="margin:2px 0"><strong>Issue Date:</strong> ${issueDate}</p>
          <p style="margin:2px 0"><strong>Due Date:</strong> ${dueDate}</p>
          <p style="margin:6px 0 0;font-weight:bold;color:#1a1a2e">Payment Terms: Due on Receipt</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead>
            <tr style="background:#f8f9fa">
              <th style="padding:8px;text-align:left;font-size:12px;color:#888;width:30px">#</th>
              <th style="padding:8px;text-align:left;font-size:12px;color:#888">Description</th>
              <th style="padding:8px;text-align:center;font-size:12px;color:#888">Qty</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:#888">Unit Price</th>
              <th style="padding:8px;text-align:right;font-size:12px;color:#888">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align:right;margin-bottom:24px">
          <p style="margin:4px 0;font-size:14px"><span style="color:#888">Subtotal:</span> M${invoice.subtotal.toFixed(2)}</p>
          ${invoice.tax_rate > 0 ? `<p style="margin:4px 0;font-size:14px"><span style="color:#888">Tax (${invoice.tax_rate}%):</span> M${taxAmount.toFixed(2)}</p>` : ""}
          <p style="margin:8px 0 0;font-size:20px;font-weight:bold">Total: M${invoice.total.toFixed(2)}</p>
        </div>
        <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:24px;border:1px solid #eee">
          <p style="color:#888;font-size:12px;margin:0 0 8px;font-weight:bold;text-transform:uppercase">Banking Details</p>
          <table style="font-size:14px">
            <tr><td style="color:#888;padding:2px 12px 2px 0">Bank:</td><td style="font-weight:600">First National Bank (FNB)</td></tr>
            <tr><td style="color:#888;padding:2px 12px 2px 0">Branch:</td><td style="font-weight:600">Pioneer Mall</td></tr>
            <tr><td style="color:#888;padding:2px 12px 2px 0">Account Number:</td><td style="font-weight:600">63027317585</td></tr>
            <tr><td style="color:#888;padding:2px 12px 2px 0">Reference:</td><td style="font-weight:600">${subscriptionRef}</td></tr>
          </table>
        </div>
        <div style="background:#eff6ff;padding:12px;border-radius:8px;margin-bottom:24px;border:1px solid #bfdbfe;text-align:center;font-size:14px">
          <span style="color:#1e40af;font-weight:600">Please send Proof of Payment (POP) to </span>
          <span style="color:#1a1a2e;font-weight:700">sales@orionlabslesotho.com</span>
        </div>
        ${invoice.notes ? `<div style="background:#f8f9fa;padding:16px;border-radius:8px;font-size:14px;margin-bottom:24px"><p style="color:#888;font-size:12px;margin:0 0 4px">Notes</p><p style="margin:0">${invoice.notes}</p></div>` : ""}
      </div>
      <div style="text-align:center;padding:20px;border:1px solid #eee;border-top:none;border-radius:0 0 8px 8px;background:#fafafa">
        <p style="margin:0;font-size:14px;font-weight:600;color:#333">Thank you for your business!</p>
        <p style="margin:6px 0 0;color:#888;font-size:12px">Orion Labs &middot; Pioneer Mall, Maseru, Lesotho &middot; sales@orionlabslesotho.com</p>
      </div>
    </div>`;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailPayload: any = {
      from: "Orion Labs <updates@updates.orionlabslesotho.com>",
      to: [sendTo],
      subject: `Invoice ${invoice.invoice_number} from Orion Labs — M${invoice.total.toFixed(2)}`,
      html,
    };

    if (pdfBase64 && pdfFilename) {
      emailPayload.attachments = [
        {
          filename: pdfFilename,
          content: pdfBase64,
        },
      ];
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Resend error:", errBody);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await serviceClient
      .from("admin_invoices")
      .update({ status: "sent" })
      .eq("id", invoiceId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
