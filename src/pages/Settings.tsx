import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useCompanyProfile, CompanyProfileInput } from '@/hooks/useCompanyProfile';
import { TemplateEditor } from '@/components/settings/TemplateEditor';
import { Building2, MapPin, Phone, CreditCard, FileText, Upload, X, Loader2 } from 'lucide-react';

export default function Settings() {
  const { profile, isLoading, saveProfile, isSaving, uploadAsset } = useCompanyProfile();
  
  const [formData, setFormData] = useState<Partial<CompanyProfileInput>>({
    company_name: '',
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
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
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
    if (url) {
      setFormData(prev => ({ ...prev, logo_url: url }));
    }
    setIsUploadingLogo(false);
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingSignature(true);
    const url = await uploadAsset(file, 'signature');
    if (url) {
      setFormData(prev => ({ ...prev, signature_url: url }));
    }
    setIsUploadingSignature(false);
  };

  const handleSave = () => {
    saveProfile(formData);
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
      
      <div className="p-6 space-y-6 max-w-4xl">
        {/* Document Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Header
            </CardTitle>
            <CardDescription>
              This information appears at the top of all your documents (quotes, invoices, delivery notes)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Company Name & Logo Row */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name || ''}
                    onChange={(e) => handleChange('company_name', e.target.value)}
                    placeholder="Your Company Name"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="registration_number">Registration Number</Label>
                    <Input
                      id="registration_number"
                      value={formData.registration_number || ''}
                      onChange={(e) => handleChange('registration_number', e.target.value)}
                      placeholder="Company registration number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat_number">VAT Number</Label>
                    <Input
                      id="vat_number"
                      value={formData.vat_number || ''}
                      onChange={(e) => handleChange('vat_number', e.target.value)}
                      placeholder="VAT registration number"
                      disabled={!formData.vat_enabled}
                    />
                  </div>
                </div>
              </div>
              
              {/* Logo */}
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {formData.logo_url ? (
                    <div className="relative">
                      <img 
                        src={formData.logo_url} 
                        alt="Company logo" 
                        className="h-20 w-20 object-contain rounded-lg border bg-background"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleChange('logo_url', null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      ref={logoInputRef}
                      disabled={isUploadingLogo}
                    />
                    <Button 
                      variant="outline" 
                      disabled={isUploadingLogo} 
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: 200x200px
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Address
              </h4>
              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input
                  id="address_line_1"
                  value={formData.address_line_1 || ''}
                  onChange={(e) => handleChange('address_line_1', e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input
                  id="address_line_2"
                  value={formData.address_line_2 || ''}
                  onChange={(e) => handleChange('address_line_2', e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code || ''}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    placeholder="Postal code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Contact Details
              </h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+266 XXXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="company@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* VAT Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              VAT Settings
            </CardTitle>
            <CardDescription>
              Configure VAT calculations for your documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="vat_enabled" className="text-base">Enable VAT</Label>
                <p className="text-sm text-muted-foreground">
                  Include VAT calculations on documents
                </p>
              </div>
              <Switch
                id="vat_enabled"
                checked={formData.vat_enabled ?? true}
                onCheckedChange={(checked) => handleChange('vat_enabled', checked)}
              />
            </div>
            {formData.vat_enabled && (
              <div className="space-y-2">
                <Label htmlFor="default_tax_rate">Default VAT Rate (%)</Label>
                <Input
                  id="default_tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.default_tax_rate || 15}
                  onChange={(e) => handleChange('default_tax_rate', parseFloat(e.target.value) || 0)}
                  placeholder="15"
                  className="max-w-[120px]"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Template */}
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

        {/* Banking Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Banking Details
            </CardTitle>
            <CardDescription>
              Bank account information for invoices and payment instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name || ''}
                  onChange={(e) => handleChange('bank_name', e.target.value)}
                  placeholder="Bank name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_account_name">Account Name</Label>
                <Input
                  id="bank_account_name"
                  value={formData.bank_account_name || ''}
                  onChange={(e) => handleChange('bank_account_name', e.target.value)}
                  placeholder="Account holder name"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bank_account_number">Account Number</Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number || ''}
                  onChange={(e) => handleChange('bank_account_number', e.target.value)}
                  placeholder="Account number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_branch_code">Branch Code</Label>
                <Input
                  id="bank_branch_code"
                  value={formData.bank_branch_code || ''}
                  onChange={(e) => handleChange('bank_branch_code', e.target.value)}
                  placeholder="Branch code"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_swift_code">SWIFT/BIC Code</Label>
              <Input
                id="bank_swift_code"
                value={formData.bank_swift_code || ''}
                onChange={(e) => handleChange('bank_swift_code', e.target.value)}
                placeholder="SWIFT/BIC code for international transfers"
              />
            </div>
          </CardContent>
        </Card>

        {/* Document Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Document Defaults
            </CardTitle>
            <CardDescription>
              Default settings applied to new quotes, invoices, and delivery notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="default_terms">Default Terms & Conditions</Label>
              <Textarea
                id="default_terms"
                value={formData.default_terms || ''}
                onChange={(e) => handleChange('default_terms', e.target.value)}
                placeholder="Payment terms, delivery conditions, etc."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer_text">Document Footer Text</Label>
              <Textarea
                id="footer_text"
                value={formData.footer_text || ''}
                onChange={(e) => handleChange('footer_text', e.target.value)}
                placeholder="Thank you for your business!"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Signature
            </CardTitle>
            <CardDescription>
              Upload a signature image to display on documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {formData.signature_url ? (
                <div className="relative">
                  <img 
                    src={formData.signature_url} 
                    alt="Signature" 
                    className="h-16 w-auto max-w-[200px] object-contain rounded-lg border bg-background p-2"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => handleChange('signature_url', null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="h-16 w-[200px] rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No signature uploaded</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                  ref={signatureInputRef}
                  disabled={isUploadingSignature}
                />
                <Button 
                  variant="outline" 
                  disabled={isUploadingSignature}
                  onClick={() => signatureInputRef.current?.click()}
                >
                  {isUploadingSignature ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Signature
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Transparent PNG recommended
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-6">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save All Changes'
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
