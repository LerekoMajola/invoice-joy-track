import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateTempPassword(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length]
  }
  return password
}

function buildPortalCredentialsEmail(
  name: string,
  email: string,
  tempPassword: string,
  loginUrl: string,
  portalType: 'gym' | 'school',
): string {
  const isGym = portalType === 'gym'
  const portalLabel = isGym ? 'GymPro Member Portal' : 'EduPro Parent Portal'
  const gradient = isGym
    ? 'linear-gradient(135deg,#16a34a,#15803d)'
    : 'linear-gradient(135deg,#4f46e5,#4338ca)'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:${gradient};padding:32px 24px;text-align:center;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${portalLabel}</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Your portal access is ready</p>
        </td></tr>
        <tr><td style="padding:32px 24px;">
          <p style="margin:0 0 16px;color:#1e293b;font-size:15px;">Hi <strong>${name}</strong>,</p>
          <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
            Your ${isGym ? 'member' : 'parent'} portal account has been created. Use the credentials below to sign in.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
            <tr><td style="padding:16px;">
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Email</p>
              <p style="margin:0 0 16px;color:#0f172a;font-size:15px;font-family:monospace;word-break:break-all;">${email}</p>
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Temporary Password</p>
              <p style="margin:0;color:#0f172a;font-size:18px;font-family:monospace;font-weight:700;letter-spacing:2px;">${tempPassword}</p>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="${loginUrl}" style="display:inline-block;background:${isGym ? '#16a34a' : '#4f46e5'};color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Open Portal</a>
          </td></tr></table>
          <div style="margin-top:24px;padding:12px 16px;background:#fef3c7;border-radius:8px;border:1px solid #fde68a;">
            <p style="margin:0;color:#92400e;font-size:13px;">⚠️ Please change your password after your first login for security.</p>
          </div>
        </td></tr>
        <tr><td style="padding:16px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">This is an automated message. Please do not reply.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

async function sendPortalCredentialsEmail(
  name: string,
  email: string,
  tempPassword: string,
  portalType: 'gym' | 'school',
  origin: string,
): Promise<void> {
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    console.warn('RESEND_API_KEY not set, skipping email')
    return
  }

  const loginUrl = `${origin}/portal?type=${portalType}`
  const html = buildPortalCredentialsEmail(name, email, tempPassword, loginUrl, portalType)
  const subject = portalType === 'gym'
    ? 'Your GymPro Member Portal Access'
    : 'Your EduPro Parent Portal Access'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Orion Labs <updates@updates.orionlabslesotho.com>',
      to: [email],
      subject,
      html,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Failed to send portal credentials email:', errText)
  } else {
    await res.text()
    console.log('Portal credentials email sent to', email)
  }
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

    const body = await req.json()
    const { memberId, studentId, portalType, name, email } = body

    if (!portalType || !name || !email || (!memberId && !studentId)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Validate record ownership
    if (portalType === 'gym' && memberId) {
      const { data: record, error } = await adminClient
        .from('gym_members')
        .select('id, owner_user_id, user_id, portal_user_id')
        .eq('id', memberId)
        .single()

      if (error || !record) {
        return new Response(JSON.stringify({ error: 'Member not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Use owner_user_id if available (backfilled), fall back to user_id for older records
      const ownerId = record.owner_user_id || record.user_id
      if (ownerId !== caller.id) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (record.portal_user_id) {
        return new Response(JSON.stringify({ error: 'Portal account already exists for this member' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else if (portalType === 'school' && studentId) {
      const { data: record, error } = await adminClient
        .from('students')
        .select('id, owner_user_id, user_id, portal_user_id')
        .eq('id', studentId)
        .single()

      if (error || !record) {
        return new Response(JSON.stringify({ error: 'Student not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Use owner_user_id if available (backfilled), fall back to user_id for older records
      const ownerId = record.owner_user_id || record.user_id
      if (ownerId !== caller.id) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (record.portal_user_id) {
        return new Response(JSON.stringify({ error: 'Portal account already exists for this student' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    } else {
      return new Response(JSON.stringify({ error: 'Invalid portalType or missing ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Generate temp password and create auth user
    const tempPassword = generateTempPassword()

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name, portal_type: portalType },
    })

    let portalUserId: string

    if (createError) {
      const isAlreadyRegistered =
        (createError as any).code === 'email_exists' ||
        createError.message?.toLowerCase().includes('already registered') ||
        createError.message?.toLowerCase().includes('already exists')

      if (!isAlreadyRegistered) {
        console.error('Error creating portal auth user:', createError)
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Email already in auth — find existing user, reset password, and link them
      console.log('User already registered, finding existing user by email:', email)
      const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      if (listError || !listData) {
        console.error('Error listing users:', listError)
        return new Response(JSON.stringify({ error: 'Failed to find existing user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const existingUser = listData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
      if (!existingUser) {
        return new Response(JSON.stringify({ error: 'Could not locate existing account' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error: updateError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
        password: tempPassword,
        user_metadata: { full_name: name, portal_type: portalType },
      })
      if (updateError) {
        console.error('Error resetting password for existing user:', updateError)
        return new Response(JSON.stringify({ error: 'Failed to reset credentials for existing account' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      portalUserId = existingUser.id
      console.log('Reusing existing user and reset password:', portalUserId)
    } else {
      portalUserId = newUser!.user.id
    }

    // Link portal_user_id back to the record (NOT user_id — that stays as the owner's ID)
    const newUserId = portalUserId
    if (portalType === 'gym' && memberId) {
      const { error: updateError } = await adminClient
        .from('gym_members')
        .update({ portal_user_id: newUserId })
        .eq('id', memberId)
      if (updateError) console.error('Error linking portal_user_id to gym_member:', updateError)
    } else if (portalType === 'school' && studentId) {
      const { error: updateError } = await adminClient
        .from('students')
        .update({ portal_user_id: newUserId })
        .eq('id', studentId)
      if (updateError) console.error('Error linking portal_user_id to student:', updateError)
    }

    // Derive origin from request
    const origin = req.headers.get('origin') || 'https://invoice-joy-track.lovable.app'
    await sendPortalCredentialsEmail(name, email, tempPassword, portalType, origin)

    return new Response(JSON.stringify({ success: true, userId: newUserId }), {
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
