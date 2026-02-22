import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }
    const userId = claimsData.claims.sub

    // Check super_admin role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'super_admin')
      .maybeSingle()

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
    }

    // Define tables to query
    const tables = [
      'invoices', 'quotes', 'clients', 'tasks', 'leads', 'job_cards',
      'legal_cases', 'gym_members', 'delivery_notes', 'staff_members',
      'hire_orders', 'bookings', 'fleet_vehicles', 'students', 'expenses'
    ]

    // Get per-user counts for each table
    const countResults: Record<string, Record<string, number>> = {}
    const featurePopularity: Record<string, number> = {}

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('user_id')

      if (error) {
        console.error(`Error querying ${table}:`, error.message)
        continue
      }

      const rows = data || []
      featurePopularity[table] = rows.length

      for (const row of rows) {
        const uid = row.user_id
        if (!uid) continue
        if (!countResults[uid]) countResults[uid] = {}
        countResults[uid][table] = (countResults[uid][table] || 0) + 1
      }
    }

    // Get company profiles for tenant names + system type
    const { data: profiles } = await supabase
      .from('company_profiles')
      .select('user_id, company_name')
      .is('deleted_at', null)

    // Get subscriptions for system type
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('user_id, system_type')

    const profileMap: Record<string, string> = {}
    for (const p of profiles || []) {
      profileMap[p.user_id] = p.company_name
    }

    const systemMap: Record<string, string> = {}
    for (const s of subscriptions || []) {
      systemMap[s.user_id] = s.system_type
    }

    // Build per-tenant usage
    const allUserIds = new Set([
      ...Object.keys(countResults),
      ...(profiles || []).map(p => p.user_id)
    ])

    // Get last activity dates - query most recent created_at per user across key tables
    const lastActiveMap: Record<string, string> = {}
    for (const table of ['invoices', 'quotes', 'clients', 'tasks', 'leads']) {
      const { data } = await supabase
        .from(table)
        .select('user_id, created_at')
        .order('created_at', { ascending: false })
        .limit(1000)

      for (const row of data || []) {
        if (!row.user_id) continue
        if (!lastActiveMap[row.user_id] || row.created_at > lastActiveMap[row.user_id]) {
          lastActiveMap[row.user_id] = row.created_at
        }
      }
    }

    const tenantUsage = Array.from(allUserIds).map(uid => {
      const counts = countResults[uid] || {}
      const invoices = counts.invoices || 0
      const quotes = counts.quotes || 0
      const clients = counts.clients || 0
      const tasks = counts.tasks || 0
      const leads = counts.leads || 0
      const staff = counts.staff_members || 0
      const jobCards = counts.job_cards || 0
      const legalCases = counts.legal_cases || 0
      const gymMembers = counts.gym_members || 0

      // Weighted engagement score
      const score = clients * 3 + invoices * 2 + quotes * 2 + tasks * 1 + leads * 2 + staff * 3

      let engagement = 'inactive'
      if (score >= 30) engagement = 'high'
      else if (score >= 15) engagement = 'medium'
      else if (score > 0) engagement = 'low'

      return {
        userId: uid,
        companyName: profileMap[uid] || 'Unknown',
        systemType: systemMap[uid] || 'business',
        invoices,
        quotes,
        clients,
        tasks,
        leads,
        staff,
        jobCards,
        legalCases,
        gymMembers,
        lastActive: lastActiveMap[uid] || null,
        engagementScore: score,
        engagement,
      }
    }).sort((a, b) => b.engagementScore - a.engagementScore)

    // Monthly activity trend (last 6 months) from invoices + quotes + clients
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    const sinceDate = sixMonthsAgo.toISOString()

    const monthlyActivity: Record<string, number> = {}
    for (const table of ['invoices', 'quotes', 'clients', 'tasks', 'leads']) {
      const { data } = await supabase
        .from(table)
        .select('created_at')
        .gte('created_at', sinceDate)

      for (const row of data || []) {
        const month = row.created_at.substring(0, 7) // YYYY-MM
        monthlyActivity[month] = (monthlyActivity[month] || 0) + 1
      }
    }

    const monthlyActivityArray = Object.entries(monthlyActivity)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Module adoption: how many unique tenants used each feature
    const moduleAdoption: Record<string, number> = {}
    for (const table of tables) {
      const usersWithRecords = new Set(
        Object.entries(countResults)
          .filter(([_, counts]) => (counts[table] || 0) > 0)
          .map(([uid]) => uid)
      )
      moduleAdoption[table] = usersWithRecords.size
    }

    const totalRecords = Object.values(featurePopularity).reduce((a, b) => a + b, 0)

    return new Response(JSON.stringify({
      tenantUsage,
      featurePopularity,
      monthlyActivity: monthlyActivityArray,
      moduleAdoption,
      summary: {
        totalRecords,
        totalTenants: tenantUsage.length,
        activeTenants: tenantUsage.filter(t => t.engagement !== 'inactive').length,
      },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('Usage analytics error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
