import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useCallback } from 'react';

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string;
  logo_url: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  registration_number: string | null;
  vat_number: string | null;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_branch_code: string | null;
  bank_swift_code: string | null;
  default_terms: string | null;
  default_tax_rate: number | null;
  default_validity_days: number | null;
  vat_enabled: boolean | null;
  signature_url: string | null;
  contact_person: string | null;
  footer_text: string | null;
  template_primary_color: string | null;
  template_secondary_color: string | null;
  template_accent_color: string | null;
  template_font_family: string | null;
  template_font_url: string | null;
  template_header_style: string | null;
  template_table_style: string | null;
  header_info: string | null;
  tax_clearance_url: string | null;
  tax_clearance_expiry_date: string | null;
  business_id_url: string | null;
  company_profile_doc_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CompanyProfileInput = Omit<CompanyProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type DocumentType = 'logo' | 'signature' | 'tax-clearance' | 'business-id' | 'company-profile-doc';

export function useCompanyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['company-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('company_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as CompanyProfile | null;
    },
    enabled: !!user?.id,
  });

  const saveProfile = useMutation({
    mutationFn: async (profileData: Partial<CompanyProfileInput>): Promise<CompanyProfile> => {
      if (!user?.id) throw new Error('User not authenticated');

      const existingProfile = profile;

      if (existingProfile) {
        const { data, error } = await supabase
          .from('company_profiles')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        return data as CompanyProfile;
      } else {
        const { data, error } = await supabase
          .from('company_profiles')
          .insert({
            ...profileData,
            user_id: user.id,
            company_name: profileData.company_name || 'My Company',
          })
          .select()
          .single();
        
        if (error) throw error;
        return data as CompanyProfile;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile', user?.id] });
      toast({
        title: 'Success',
        description: 'Company profile saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to save company profile.',
        variant: 'destructive',
      });
      console.error('Save profile error:', error);
    },
  });

  const uploadAsset = async (file: File, type: DocumentType): Promise<string | null> => {
    if (!user?.id) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload file.',
        variant: 'destructive',
      });
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('company-assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Convenience boolean for checking if profile exists
  const hasProfile = !!profile;

  // Wrapper to expose mutate with options
  const saveProfileWithOptions = useCallback(
    (data: Partial<CompanyProfileInput>, options?: { onSuccess?: () => void }) => {
      saveProfile.mutate(data, options);
    },
    [saveProfile]
  );

  return {
    profile,
    isLoading,
    error,
    hasProfile,
    saveProfile: saveProfileWithOptions,
    isSaving: saveProfile.isPending,
    uploadAsset,
  };
}
