import { supabase } from '@/integrations/supabase/client';

/**
 * Resolves the correct owner user_id and company_profile_id for record creation.
 * When a staff member creates a record, this ensures it's attributed to the owner,
 * not the staff member's own account.
 */
export async function resolveOwnerIds(
  userId: string,
  activeCompanyUserId: string | undefined,
  activeCompanyId: string | null | undefined
): Promise<{ ownerId: string; companyProfileId: string | null }> {
  // If activeCompany context is available, use it directly
  if (activeCompanyUserId && activeCompanyId) {
    return { ownerId: activeCompanyUserId, companyProfileId: activeCompanyId };
  }

  // Fallback: check if user is a staff member and resolve owner
  const { data: staffData } = await supabase
    .from('staff_members')
    .select('owner_user_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (staffData?.owner_user_id) {
    const ownerUserId = staffData.owner_user_id;

    // Find the owner's company profile
    const { data: companyData } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', ownerUserId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    return {
      ownerId: ownerUserId,
      companyProfileId: companyData?.id || activeCompanyId || null,
    };
  }

  // Not staff — use current user's own IDs
  return {
    ownerId: activeCompanyUserId || userId,
    companyProfileId: activeCompanyId || null,
  };
}
