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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is super_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });
    }

    // Get all staff members with user_id set
    const { data: staffMembers, error: staffError } = await supabase
      .from('staff_members')
      .select('id, user_id, owner_user_id')
      .not('user_id', 'is', null);

    if (staffError) throw staffError;
    if (!staffMembers || staffMembers.length === 0) {
      return new Response(JSON.stringify({ message: 'No staff members found', updated: 0 }), { headers: corsHeaders });
    }

    const tables = ['quotes', 'invoices', 'clients', 'delivery_notes', 'tasks', 'leads', 'contacts'];
    const results: Record<string, number> = {};
    let totalUpdated = 0;

    for (const staff of staffMembers) {
      if (!staff.user_id || !staff.owner_user_id) continue;

      // Get owner's first company profile
      const { data: companyProfile } = await supabase
        .from('company_profiles')
        .select('id')
        .eq('user_id', staff.owner_user_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!companyProfile) continue;

      for (const table of tables) {
        const { data: updated, error: updateError } = await supabase
          .from(table)
          .update({
            user_id: staff.owner_user_id,
            company_profile_id: companyProfile.id,
          })
          .eq('user_id', staff.user_id)
          .select('id');

        if (updateError) {
          console.error(`Error updating ${table} for staff ${staff.id}:`, updateError);
          continue;
        }

        const count = updated?.length || 0;
        if (count > 0) {
          results[`${table}_staff_${staff.id}`] = count;
          totalUpdated += count;
        }
      }
    }

    return new Response(
      JSON.stringify({ message: 'Done', totalUpdated, details: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
