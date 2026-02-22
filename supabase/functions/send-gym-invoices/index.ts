import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Get all active subscriptions with member and plan details
    const { data: activeSubs, error: subsError } = await supabase
      .from('gym_member_subscriptions')
      .select('id, member_id, plan_id, plan_name, amount_paid, user_id, company_profile_id')
      .eq('status', 'active');

    if (subsError) throw subsError;
    if (!activeSubs || activeSubs.length === 0) {
      return new Response(JSON.stringify({ message: 'No active subscriptions found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get already-sent logs for this month to avoid duplicates
    const subIds = activeSubs.map(s => s.id);
    const { data: sentLogs } = await supabase
      .from('gym_invoice_logs')
      .select('subscription_id')
      .eq('billing_month', billingMonth)
      .in('subscription_id', subIds);

    const alreadySentIds = new Set((sentLogs || []).map(l => l.subscription_id));

    // Filter out already-sent
    const toSend = activeSubs.filter(s => !alreadySentIds.has(s.id));
    if (toSend.length === 0) {
      return new Response(JSON.stringify({ message: 'All invoices already sent for this month' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Collect unique member IDs and company profile IDs
    const memberIds = [...new Set(toSend.map(s => s.member_id))];
    const companyIds = [...new Set(toSend.map(s => s.company_profile_id).filter(Boolean))];

    // Fetch members
    const { data: members } = await supabase
      .from('gym_members')
      .select('id, first_name, last_name, email, member_number')
      .in('id', memberIds);
    const memberMap = new Map((members || []).map(m => [m.id, m]));

    // Fetch company profiles
    const { data: companies } = await supabase
      .from('company_profiles')
      .select('id, company_name, logo_url, email, bank_name, bank_account_name, bank_account_number, bank_branch_code, bank_swift_code')
      .in('id', companyIds);
    const companyMap = new Map((companies || []).map(c => [c.id, c]));

    // Fetch plan details
    const planIds = [...new Set(toSend.map(s => s.plan_id).filter(Boolean))];
    const { data: plans } = await supabase
      .from('gym_membership_plans')
      .select('id, name, price')
      .in('id', planIds);
    const planMap = new Map((plans || []).map(p => [p.id, p]));

    let emailsSent = 0;
    let skipped = 0;

    for (const sub of toSend) {
      const member = memberMap.get(sub.member_id);
      if (!member?.email) { skipped++; continue; }

      const company = companyMap.get(sub.company_profile_id);
      const plan = planMap.get(sub.plan_id);
      const gymName = company?.company_name || 'Your Gym';
      const planName = sub.plan_name || plan?.name || 'Membership';
      const amount = plan?.price || sub.amount_paid || 0;
      const amountFormatted = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

      // Build bank details section
      let bankHtml = '';
      if (company?.bank_name) {
        bankHtml = `
          <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #374151; font-weight: 600; margin: 0 0 8px;">Bank Payment Details</p>
            <table style="width: 100%; font-size: 13px; color: #4b5563;">
              <tr><td style="padding: 2px 0;">Bank</td><td style="text-align: right;">${company.bank_name}</td></tr>
              ${company.bank_account_name ? `<tr><td style="padding: 2px 0;">Account Name</td><td style="text-align: right;">${company.bank_account_name}</td></tr>` : ''}
              ${company.bank_account_number ? `<tr><td style="padding: 2px 0;">Account Number</td><td style="text-align: right;">${company.bank_account_number}</td></tr>` : ''}
              ${company.bank_branch_code ? `<tr><td style="padding: 2px 0;">Branch Code</td><td style="text-align: right;">${company.bank_branch_code}</td></tr>` : ''}
              ${company.bank_swift_code ? `<tr><td style="padding: 2px 0;">Swift Code</td><td style="text-align: right;">${company.bank_swift_code}</td></tr>` : ''}
            </table>
            <p style="color: #6b7280; font-size: 12px; margin: 8px 0 0;">Reference: ${member.member_number || member.first_name}</p>
          </div>
        `;
      }

      const logoHtml = company?.logo_url
        ? `<img src="${company.logo_url}" alt="${gymName}" style="max-height: 48px; margin-bottom: 8px;" />`
        : '';

      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 540px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
          <div style="background: #1a1a2e; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
            ${logoHtml}
            <h1 style="color: #ffffff; font-size: 20px; margin: 0;">${gymName}</h1>
            <p style="color: #a0aec0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 4px 0 0;">Monthly Invoice</p>
          </div>

          <p style="color: #374151; font-size: 15px;">Hi ${member.first_name},</p>
          <p style="color: #6b7280; font-size: 14px;">Here is your membership invoice for <strong>${monthLabel}</strong>.</p>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <table style="width: 100%; font-size: 14px; color: #374151;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Plan</td>
                <td style="text-align: right;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Period</td>
                <td style="text-align: right;">${monthLabel}</td>
              </tr>
              <tr style="border-top: 1px solid #e5e7eb;">
                <td style="padding: 10px 0; font-weight: 700; font-size: 16px;">Amount Due</td>
                <td style="text-align: right; font-weight: 700; font-size: 16px; color: #1a1a2e;">${amountFormatted}</td>
              </tr>
            </table>
          </div>

          ${bankHtml}

          <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
            Please ensure payment is made by the end of the month. You can upload your proof of payment via the member portal.
          </p>

          <div style="margin: 24px 0; text-align: center;">
            <a href="https://invoice-joy-track.lovable.app/portal" style="background: #1a1a2e; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
              Open Member Portal →
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
            Member #${member.member_number || '—'} · ${gymName}
          </p>
        </div>
      `;

      // Send via Resend
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: `${gymName} <updates@updates.orionlabslesotho.com>`,
          to: [member.email],
          subject: `${gymName} — Invoice for ${monthLabel}`,
          html: emailHtml,
        }),
      });

      if (emailRes.ok) {
        // Log the sent invoice
        await supabase.from('gym_invoice_logs').insert({
          user_id: sub.user_id,
          company_profile_id: sub.company_profile_id,
          member_id: sub.member_id,
          subscription_id: sub.id,
          billing_month: billingMonth,
        });
        emailsSent++;
      } else {
        const errText = await emailRes.text();
        console.error(`Failed to send to ${member.email}:`, errText);
      }
    }

    return new Response(
      JSON.stringify({ message: `Sent ${emailsSent} invoices, skipped ${skipped} (no email)`, billingMonth }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-gym-invoices:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
