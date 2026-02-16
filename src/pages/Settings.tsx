import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCompanyProfile, CompanyProfileInput, DocumentType } from '@/hooks/useCompanyProfile';
import { TemplateEditor } from '@/components/settings/TemplateEditor';
import { TaxClearanceList } from '@/components/settings/TaxClearanceList';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { Building2, CreditCard, FileText, Upload, X, Loader2, FileCheck, Briefcase, FileUser, ExternalLink, Bell, Database, Lock, Palette, Settings2, PenTool, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChangePasswordCard } from '@/components/settings/ChangePasswordCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';

export default function Settings() {
  const { profile, isLoading, saveProfile, isSaving, uploadAsset } = useCompanyProfile();
  const { systemType } = useSubscription();
  const { refetchCompanies } = useActiveCompany();
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleSendBackup = async () => {
    setIsBackingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data-backup');
      if (error) throw error;
      toast.success('Backup sent! Check your email for the CSV attachments.');
    } catch (err: any) {
      console.error('Backup error:', err);
      toast.error(err.message || 'Failed to send backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const [formData, setFormData] = useState<Partial<CompanyProfileInput>>({
    company_name: '',
    contact_person: '',
    logo_url: null,
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    country: 'Lesotho',
    phone: '',
    email: '',
    website: '',
    registration_number: '',
    vat_number: '',
    bank_name: '',
    bank_account_name: '',
    bank_account_number: '',
    bank_branch_code: '',
    bank_swift_code: '',
    default_terms: 'Payment is due within 30 days of invoice date.',
    default_tax_rate: 15,
    default_validity_days: 90,
    vat_enabled: true,
    signature_url: null,
    footer_text: '',
    template_primary_color: 'hsl(230, 35%, 18%)',
    template_secondary_color: 'hsl(230, 25%, 95%)',
    template_accent_color: 'hsl(230, 35%, 25%)',
    template_font_family: 'DM Sans',
    template_font_url: null,
    template_header_style: 'classic',
    template_table_style: 'striped',
    header_info: '',
    business_id_url: null,
    company_profile_doc_url: null,
  });

  // Sync currency from profile
  useEffect(() => {
    if (profile && (profile as any).currency) {
      setFormData(prev => ({ ...prev, currency: (profile as any).currency }));
    }
  }, [profile]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const businessIdInputRef = useRef<HTMLInputElement>(null);
  const companyProfileDocInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [isUploadingBusinessId, setIsUploadingBusinessId] = useState(false);
  const [isUploadingCompanyProfileDoc, setIsUploadingCompanyProfileDoc] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        contact_person: (profile as any).contact_person || '',
        logo_url: profile.logo_url,
        address_line_1: profile.address_line_1 || '',
        address_line_2: profile.address_line_2 || '',
        city: profile.city || '',
        postal_code: profile.postal_code || '',
        country: profile.country || 'Lesotho',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        registration_number: profile.registration_number || '',
        vat_number: profile.vat_number || '',
        bank_name: profile.bank_name || '',
        bank_account_name: profile.bank_account_name || '',
        bank_account_number: profile.bank_account_number || '',
        bank_branch_code: profile.bank_branch_code || '',
        bank_swift_code: profile.bank_swift_code || '',
        default_terms: profile.default_terms || 'Payment is due within 30 days of invoice date.',
        default_tax_rate: profile.default_tax_rate || 15,
        default_validity_days: profile.default_validity_days || 90,
        vat_enabled: profile.vat_enabled ?? true,
        signature_url: profile.signature_url,
        footer_text: profile.footer_text || '',
        template_primary_color: profile.template_primary_color || 'hsl(230, 35%, 18%)',
        template_secondary_color: profile.template_secondary_color || 'hsl(230, 25%, 95%)',
        template_accent_color: profile.template_accent_color || 'hsl(230, 35%, 25%)',
        template_font_family: profile.template_font_family || 'DM Sans',
        template_font_url: profile.template_font_url,
        template_header_style: profile.template_header_style || 'classic',
        template_table_style: profile.template_table_style || 'striped',
        header_info: profile.header_info || '',
        business_id_url: profile.business_id_url,
        company_profile_doc_url: profile.company_profile_doc_url,
      });
    }
  }, [profile]);

  const handleChange = (field: keyof CompanyProfileInput, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    const url = await uploadAsset(file, 'logo');
    if (url) setFormData(prev => ({ ...prev, logo_url: url }));
    setIsUploadingLogo(false);
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingSignature(true);
    const url = await uploadAsset(file, 'signature');
    if (url) setFormData(prev => ({ ...prev, signature_url: url }));
    setIsUploadingSignature(false);
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType,
    urlField: keyof CompanyProfileInput,
    setUploading: (v: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadAsset(file, type);
    if (url) setFormData(prev => ({ ...prev, [urlField]: url }));
    setUploading(false);
  };

  const handleSave = () => {
    saveProfile(formData, { onSuccess: () => refetchCompanies() });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header title="Company Settings" subtitle="Manage your company profile and document defaults" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const profileLabel = systemType === 'legal' ? 'LawPro Profile' : systemType === 'school' ? 'EduPro Profile' : systemType === 'workshop' ? 'ShopPro Profile' : systemType === 'hire' ? 'HirePro Profile' : systemType === 'guesthouse' ? 'StayPro Profile' : systemType === 'fleet' ? 'FleetPro Profile' : systemType === 'gym' ? 'GymPro Profile' : 'BizPro Profile';
  const companyLabel = systemType === 'legal' ? 'Firm Name' : systemType === 'school' ? 'School Name' : systemType === 'workshop' ? 'Workshop Name' : systemType === 'hire' ? 'Business Name' : systemType === 'gym' ? 'Gym Name' : 'Company Name';

  return (
    <DashboardLayout>
      <Header 
        title="Company Settings" 
        subtitle="Manage your company profile and document defaults"
        action={{
          label: 'Save Changes',
          onClick: handleSave,
        }}
      />
      
      <div className="p-4 md:p-6 max-w-4xl pb-safe">
        <Tabs defaultValue="profile" className="w-full">
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 mb-6">
            <TabsList className="inline-flex h-10 w-auto min-w-full md:min-w-0">
              <TabsTrigger value="profile" className="gap-1.5 text-xs md:text-sm"><Building2 className="h-4 w-4" /><span className="hidden sm:inline">Profile</span></TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5 text-xs md:text-sm"><Lock className="h-4 w-4" /><span className="hidden sm:inline">Security</span></TabsTrigger>
              <TabsTrigger value="header" className="gap-1.5 text-xs md:text-sm"><FileText className="h-4 w-4" /><span className="hidden sm:inline">Header</span></TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5 text-xs md:text-sm"><Bell className="h-4 w-4" /><span className="hidden sm:inline">Alerts</span></TabsTrigger>
              <TabsTrigger value="backup" className="gap-1.5 text-xs md:text-sm"><Database className="h-4 w-4" /><span className="hidden sm:inline">Backup</span></TabsTrigger>
              <TabsTrigger value="vat" className="gap-1.5 text-xs md:text-sm"><Building2 className="h-4 w-4" /><span className="hidden sm:inline">VAT</span></TabsTrigger>
              <TabsTrigger value="template" className="gap-1.5 text-xs md:text-sm"><Palette className="h-4 w-4" /><span className="hidden sm:inline">Template</span></TabsTrigger>
              <TabsTrigger value="banking" className="gap-1.5 text-xs md:text-sm"><CreditCard className="h-4 w-4" /><span className="hidden sm:inline">Banking</span></TabsTrigger>
              <TabsTrigger value="defaults" className="gap-1.5 text-xs md:text-sm"><Settings2 className="h-4 w-4" /><span className="hidden sm:inline">Defaults</span></TabsTrigger>
              <TabsTrigger value="signature" className="gap-1.5 text-xs md:text-sm"><PenTool className="h-4 w-4" /><span className="hidden sm:inline">Signature</span></TabsTrigger>
              <TabsTrigger value="documents" className="gap-1.5 text-xs md:text-sm"><FileCheck className="h-4 w-4" /><span className="hidden sm:inline">Documents</span></TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />{profileLabel}</CardTitle>
                <CardDescription>Your business identity — this information is required for full platform access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">{companyLabel} *</Label>
                      <Input id="company_name" value={formData.company_name || ''} onChange={(e) => handleChange('company_name', e.target.value)} placeholder="Enter your company name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input id="contact_person" value={formData.contact_person || ''} onChange={(e) => handleChange('contact_person', e.target.value)} placeholder="Primary contact name" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={formData.email || ''} onChange={(e) => handleChange('email', e.target.value)} placeholder="info@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <PhoneInput value={formData.phone || ''} onChange={(val) => handleChange('phone', val)} />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" value={formData.website || ''} onChange={(e) => handleChange('website', e.target.value)} placeholder="https://example.com" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="address_line_1">Address Line 1</Label>
                      <Input id="address_line_1" value={formData.address_line_1 || ''} onChange={(e) => handleChange('address_line_1', e.target.value)} placeholder="Street address" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address_line_2">Address Line 2</Label>
                      <Input id="address_line_2" value={formData.address_line_2 || ''} onChange={(e) => handleChange('address_line_2', e.target.value)} placeholder="Suite, unit, etc." />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city || ''} onChange={(e) => handleChange('city', e.target.value)} placeholder="City" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input id="postal_code" value={formData.postal_code || ''} onChange={(e) => handleChange('postal_code', e.target.value)} placeholder="Postal code" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={formData.country || 'Lesotho'} onChange={(e) => handleChange('country', e.target.value)} placeholder="Country" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="registration_number">Registration Number</Label>
                      <Input id="registration_number" value={formData.registration_number || ''} onChange={(e) => handleChange('registration_number', e.target.value)} placeholder="Business registration number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vat_number">VAT Number</Label>
                      <Input id="vat_number" value={formData.vat_number || ''} onChange={(e) => handleChange('vat_number', e.target.value)} placeholder="VAT registration number" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <ChangePasswordCard />
          </TabsContent>

          {/* Document Header Tab */}
          <TabsContent value="header">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Document Header</CardTitle>
                <CardDescription>This information appears at the top of all your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="header_info">Top Information</Label>
                      <Textarea
                        id="header_info"
                        value={formData.header_info || ''}
                        onChange={(e) => handleChange('header_info', e.target.value)}
                        placeholder={`YOUR COMPANY NAME\nREG NO: Your registration number\nTIN NO: Your tax number\nADDRESS: Your business address\nTEL: Your phone number\nEMAIL: Your email address`}
                        className="min-h-[180px] font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Enter your company header exactly as you want it to appear on documents</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-4">
                        {formData.logo_url ? (
                          <div className="relative">
                            <img src={formData.logo_url} alt="Company logo" className="h-20 w-20 object-contain rounded-lg border bg-background" />
                            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => handleChange('logo_url', null)}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-muted-foreground/50" />
                          </div>
                        )}
                        <div>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" ref={logoInputRef} disabled={isUploadingLogo} />
                          <Button variant="outline" disabled={isUploadingLogo} onClick={() => logoInputRef.current?.click()}>
                            {isUploadingLogo ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />Upload Logo</>)}
                          </Button>
                          <p className="text-xs text-muted-foreground mt-1">Recommended: 200x200px</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notifications</CardTitle>
                <CardDescription>Configure how you receive reminders and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationPreferences />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-primary" />Data Backup</CardTitle>
                <CardDescription>Your data is automatically backed up every Sunday. You can also trigger a manual backup.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Send Backup Now</p>
                    <p className="text-xs text-muted-foreground">Export all your data as CSV files and send to your email</p>
                  </div>
                  <Button onClick={handleSendBackup} disabled={isBackingUp} variant="outline">
                    {isBackingUp ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</>) : (<><Database className="h-4 w-4 mr-2" />Send Backup</>)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VAT Tab */}
          <TabsContent value="vat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" />VAT Settings</CardTitle>
                <CardDescription>Configure VAT calculations for your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="vat_enabled" className="text-base">Enable VAT</Label>
                      <p className="text-sm text-muted-foreground">Include VAT calculations on documents</p>
                    </div>
                    <Switch id="vat_enabled" checked={formData.vat_enabled ?? true} onCheckedChange={(checked) => handleChange('vat_enabled', checked)} />
                  </div>
                  {formData.vat_enabled && (
                    <div className="space-y-2">
                      <Label htmlFor="default_tax_rate">Default VAT Rate (%)</Label>
                      <Input id="default_tax_rate" type="number" min="0" max="100" step="0.1" value={formData.default_tax_rate || 15} onChange={(e) => handleChange('default_tax_rate', parseFloat(e.target.value) || 0)} placeholder="15" className="max-w-[120px]" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template">
            <TemplateEditor
              value={{
                template_primary_color: formData.template_primary_color || 'hsl(230, 35%, 18%)',
                template_secondary_color: formData.template_secondary_color || 'hsl(230, 25%, 95%)',
                template_accent_color: formData.template_accent_color || 'hsl(230, 35%, 25%)',
                template_font_family: formData.template_font_family || 'DM Sans',
                template_font_url: formData.template_font_url || null,
                template_header_style: formData.template_header_style || 'classic',
                template_table_style: formData.template_table_style || 'striped',
              }}
              onChange={(field, value) => handleChange(field, value)}
            />
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" />Banking Details</CardTitle>
                <CardDescription>Bank account information for invoices and payment instructions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Bank Name</Label>
                      <Input id="bank_name" value={formData.bank_name || ''} onChange={(e) => handleChange('bank_name', e.target.value)} placeholder="Bank name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_name">Account Name</Label>
                      <Input id="bank_account_name" value={formData.bank_account_name || ''} onChange={(e) => handleChange('bank_account_name', e.target.value)} placeholder="Account holder name" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account_number">Account Number</Label>
                      <Input id="bank_account_number" value={formData.bank_account_number || ''} onChange={(e) => handleChange('bank_account_number', e.target.value)} placeholder="Account number" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_branch_code">Branch Code</Label>
                      <Input id="bank_branch_code" value={formData.bank_branch_code || ''} onChange={(e) => handleChange('bank_branch_code', e.target.value)} placeholder="Branch code" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bank_swift_code">SWIFT/BIC Code</Label>
                    <Input id="bank_swift_code" value={formData.bank_swift_code || ''} onChange={(e) => handleChange('bank_swift_code', e.target.value)} placeholder="SWIFT/BIC code for international transfers" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Defaults Tab */}
          <TabsContent value="defaults">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" />Document Defaults</CardTitle>
                <CardDescription>Default settings applied to new quotes, invoices, and delivery notes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={(formData as any).currency || 'LSL'} onValueChange={(val) => handleChange('currency' as any, val)}>
                      <SelectTrigger className="max-w-[240px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                              <span className="font-mono font-semibold w-8">{c.symbol}</span>
                              <span>{c.name} ({c.code})</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Currency used for all monetary values in this company</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_validity_days">Default Quote Validity (days)</Label>
                    <Input id="default_validity_days" type="number" min="1" max="365" value={formData.default_validity_days || 90} onChange={(e) => handleChange('default_validity_days', parseInt(e.target.value) || 90)} placeholder="90" className="max-w-[120px]" />
                    <p className="text-xs text-muted-foreground">Standard for government tenders is 90 days</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_terms">Default Terms & Conditions</Label>
                    <Textarea id="default_terms" value={formData.default_terms || ''} onChange={(e) => handleChange('default_terms', e.target.value)} placeholder="Payment terms, delivery conditions, etc." rows={4} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="footer_text">Document Footer Text</Label>
                    <Textarea id="footer_text" value={formData.footer_text || ''} onChange={(e) => handleChange('footer_text', e.target.value)} placeholder="Thank you for your business!" rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Signature Tab */}
          <TabsContent value="signature">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><PenTool className="h-5 w-5 text-primary" />Signature</CardTitle>
                <CardDescription>Upload a signature image to display on documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {formData.signature_url ? (
                      <div className="relative">
                        <img src={formData.signature_url} alt="Signature" className="h-16 w-auto max-w-[200px] object-contain rounded-lg border bg-background p-2" />
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => handleChange('signature_url', null)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-16 w-[200px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">No signature uploaded</span>
                      </div>
                    )}
                    <div>
                      <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" ref={signatureInputRef} disabled={isUploadingSignature} />
                      <Button variant="outline" disabled={isUploadingSignature} onClick={() => signatureInputRef.current?.click()}>
                        {isUploadingSignature ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />Upload Signature</>)}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">Transparent PNG recommended</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" />Company Documents</CardTitle>
                <CardDescription>Upload and manage your important company documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Tax Clearance Certificates */}
                  <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <FileCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">Tax Clearance Certificates</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Upload tax clearance documents for different business activities</p>
                    <TaxClearanceList />
                  </div>

                  {/* Business ID */}
                  <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                        <Briefcase className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Business Registration / ID</h4>
                    </div>
                    <div className="space-y-3">
                      {formData.business_id_url ? (
                        <div className="flex items-center gap-3 p-3 rounded-md bg-background border">
                          <FileText className="h-8 w-8 text-emerald-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Business Registration Certificate</p>
                            <p className="text-xs text-muted-foreground">Document uploaded</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" asChild>
                              <a href={formData.business_id_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleChange('business_id_url', null)}><X className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-20 rounded-md border-2 border-dashed border-emerald-200 dark:border-emerald-800">
                          <span className="text-sm text-muted-foreground">No document uploaded</span>
                        </div>
                      )}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentUpload(e, 'business-id', 'business_id_url', setIsUploadingBusinessId)} className="hidden" ref={businessIdInputRef} disabled={isUploadingBusinessId} />
                      <Button variant="outline" size="sm" disabled={isUploadingBusinessId} onClick={() => businessIdInputRef.current?.click()}>
                        {isUploadingBusinessId ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />{formData.business_id_url ? 'Replace' : 'Upload'}</>)}
                      </Button>
                    </div>
                  </div>

                  {/* Company Profile Document */}
                  <div className="rounded-lg border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <FileUser className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-purple-900 dark:text-purple-100">Company Profile Document</h4>
                    </div>
                    <div className="space-y-3">
                      {formData.company_profile_doc_url ? (
                        <div className="flex items-center gap-3 p-3 rounded-md bg-background border">
                          <FileText className="h-8 w-8 text-purple-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">Company Profile</p>
                            <p className="text-xs text-muted-foreground">Document uploaded</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" asChild>
                              <a href={formData.company_profile_doc_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleChange('company_profile_doc_url', null)}><X className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-20 rounded-md border-2 border-dashed border-purple-200 dark:border-purple-800">
                          <span className="text-sm text-muted-foreground">No document uploaded</span>
                        </div>
                      )}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleDocumentUpload(e, 'company-profile-doc', 'company_profile_doc_url', setIsUploadingCompanyProfileDoc)} className="hidden" ref={companyProfileDocInputRef} disabled={isUploadingCompanyProfileDoc} />
                      <Button variant="outline" size="sm" disabled={isUploadingCompanyProfileDoc} onClick={() => companyProfileDocInputRef.current?.click()}>
                        {isUploadingCompanyProfileDoc ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Uploading...</>) : (<><Upload className="h-4 w-4 mr-2" />{formData.company_profile_doc_url ? 'Replace' : 'Upload'}</>)}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end py-6">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : ('Save All Changes')}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
