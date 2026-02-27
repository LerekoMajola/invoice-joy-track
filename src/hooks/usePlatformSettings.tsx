import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

function usePlatformSetting(key: string) {
  const queryClient = useQueryClient();

  const { data: value, isLoading } = useQuery({
    queryKey: ['platform-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();

      if (error) {
        console.error(`Error fetching ${key}:`, error);
        return null;
      }
      return data?.value ?? null;
    },
    staleTime: 1000 * 60 * 30,
  });

  const updateValue = useMutation({
    mutationFn: async (url: string | null) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('platform_settings')
          .update({ value: url, updated_at: new Date().toISOString() })
          .eq('key', key);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('platform_settings')
          .insert({ key, value: url });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
    },
  });

  return { value: value ?? null, isLoading, updateValue };
}

export function usePlatformSettings() {
  const logo = usePlatformSetting('platform_logo_url');
  const favicon = usePlatformSetting('platform_favicon_url');
  const appIcon = usePlatformSetting('platform_app_icon_url');

  return {
    logoUrl: logo.value,
    isLoading: logo.isLoading,
    updateLogoUrl: logo.updateValue,
    faviconUrl: favicon.value,
    isFaviconLoading: favicon.isLoading,
    updateFaviconUrl: favicon.updateValue,
    appIconUrl: appIcon.value,
    isAppIconLoading: appIcon.isLoading,
    updateAppIconUrl: appIcon.updateValue,
  };
}

const BANKING_DEFAULTS = {
  bank_name: 'First National Bank (FNB)',
  bank_account_name: 'Orion Labs (Pty) Ltd',
  bank_account_number: '63027317585',
  bank_branch_code: '280061',
  bank_branch_name: 'Pioneer Mall',
  bank_pop_email: 'sales@orionlabslesotho.com',
};

export type BankingDetails = typeof BANKING_DEFAULTS;

export function usePlatformBanking() {
  const bankName = usePlatformSetting('bank_name');
  const accountName = usePlatformSetting('bank_account_name');
  const accountNumber = usePlatformSetting('bank_account_number');
  const branchCode = usePlatformSetting('bank_branch_code');
  const branchName = usePlatformSetting('bank_branch_name');
  const popEmail = usePlatformSetting('bank_pop_email');

  const settings = [bankName, accountName, accountNumber, branchCode, branchName, popEmail];
  const isLoading = settings.some(s => s.isLoading);

  const banking: BankingDetails = {
    bank_name: bankName.value || BANKING_DEFAULTS.bank_name,
    bank_account_name: accountName.value || BANKING_DEFAULTS.bank_account_name,
    bank_account_number: accountNumber.value || BANKING_DEFAULTS.bank_account_number,
    bank_branch_code: branchCode.value || BANKING_DEFAULTS.bank_branch_code,
    bank_branch_name: branchName.value || BANKING_DEFAULTS.bank_branch_name,
    bank_pop_email: popEmail.value || BANKING_DEFAULTS.bank_pop_email,
  };

  const updateAll = async (values: BankingDetails) => {
    await Promise.all([
      bankName.updateValue.mutateAsync(values.bank_name),
      accountName.updateValue.mutateAsync(values.bank_account_name),
      accountNumber.updateValue.mutateAsync(values.bank_account_number),
      branchCode.updateValue.mutateAsync(values.bank_branch_code),
      branchName.updateValue.mutateAsync(values.bank_branch_name),
      popEmail.updateValue.mutateAsync(values.bank_pop_email),
    ]);
  };

  return { banking, isLoading, updateAll, defaults: BANKING_DEFAULTS };
}
