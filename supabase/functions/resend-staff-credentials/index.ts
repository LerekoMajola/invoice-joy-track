import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateTempPassword(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}

function buildCredentialsEmail(name: string, email: string, tempPassword: string, loginUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">Orion Labs</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Staff Account Credentials</p>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <p style="margin:0 0 16px;color:#1e293b;font-size:15px;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">Your login credentials have been updated. Use the details below to log in.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
              <p style="margin:0 0 16px;color:#0f172a;font-size:15px;font-family:monospace;word-break:break-all;">${email}</p>
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Temporary Password</p>
              <p style="margin:0;color:#0f172a;font-size:15px;font-family:monospace;">${tempPassword}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${loginUrl}" style="display:inline-block;background:#1e293b;color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Login Now</a>
          </td></tr></table>
          <div style="margin-top:24px;padding:12px 16px;background:#fef3c7;border-radius:8px;border:1px solid #fde68a;">
            <p style="margin:0;color:#92400e;font-size:13px;">⚠️ Please change your password after logging in for security.</p>
          </div>
        </td></tr>
        <tr><td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">© Orion Labs. This is an automated message.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user: caller }, error: authError } = await userClient.auth.getUser()
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { staffMemberId } = await req.json()
    if (!staffMemberId) {
      return new Response(JSON.stringify({ error: 'Missing staffMemberId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: staffRecord, error: staffError } = await adminClient
      .from('staff_members')
      .select('id, owner_user_id, user_id, name, email')
      .eq('id', staffMemberId)
      .single()

    if (staffError || !staffRecord) {
      return new Response(JSON.stringify({ error: 'Staff member not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (staffRecord.owner_user_id !== caller.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!staffRecord.user_id) {
      return new Response(JSON.stringify({ error: 'No account linked to this staff member' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate new temp password and update auth user
    const tempPassword = generateTempPassword()
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      staffRecord.user_id,
      { password: tempPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return new Response(JSON.stringify({ error: 'Failed to reset password' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send email
    if (resendApiKey) {
      const loginUrl = 'https://invoice-joy-track.lovable.app/auth'
      const html = buildCredentialsEmail(staffRecord.name, staffRecord.email, tempPassword, loginUrl)

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Orion Labs <updates@updates.orionlabslesotho.com>',
          to: [staffRecord.email],
          subject: 'Your Updated Login Credentials — Orion Labs',
          html,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('Failed to send email:', errText)
        return new Response(JSON.stringify({ error: 'Password reset but email failed to send' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      await res.text()
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
