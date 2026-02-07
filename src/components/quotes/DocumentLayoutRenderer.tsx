import React from 'react';
import type { DocumentTemplate, HeaderStyle } from './DocumentTemplates';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CompanyInfo {
  lines: string[];
  logoUrl?: string | null;
}

export interface DocumentField {
  label: string;
  value: React.ReactNode;
}

// ──────────────────────────────────────────────
// Document Header Renderer
// ──────────────────────────────────────────────

interface DocumentHeaderProps {
  template: DocumentTemplate;
  company: CompanyInfo;
  documentTitle: string;
  fields: DocumentField[];
  extraTitleContent?: React.ReactNode;
}

function LogoOrPlaceholder({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return <img src={logoUrl} alt="Company Logo" className="h-14 object-contain" />;
  }
  return (
    <div className="h-14 w-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
      No Logo
    </div>
  );
}

function CompanyLines({ lines, color }: { lines: string[]; color: string }) {
  return (
    <div className="text-sm leading-tight" style={{ color }}>
      {lines.map((line, idx) => (
        <p key={idx} className={idx === 0 ? 'text-xl font-bold mb-0.5' : 'text-gray-600'}>
          {line}
        </p>
      ))}
    </div>
  );
}

function FieldsBlock({ fields, color }: { fields: DocumentField[]; color: string }) {
  return (
    <div className="text-right space-y-1">
      {fields.map((field, idx) => (
        <div key={idx} className="flex justify-end gap-4 items-center">
          <span className="text-sm font-semibold" style={{ color }}>{field.label}</span>
          <span className="text-sm text-gray-900 w-32">{field.value}</span>
        </div>
      ))}
    </div>
  );
}

// ── Classic: Company left, logo right, title right-aligned ──
function ClassicHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 max-w-md">
          <CompanyLines lines={company.lines} color={template.primaryColor} />
        </div>
        <LogoOrPlaceholder logoUrl={company.logoUrl} />
      </div>
      <div className="text-right mb-3">
        <h1 className="text-3xl font-light tracking-widest uppercase" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        {extraTitleContent}
      </div>
    </>
  );
}

// ── Modern: Full-width color banner with centered company name ──
function ModernHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div
        className="rounded-lg p-6 mb-4 text-center"
        style={{ backgroundColor: template.primaryColor, color: 'white' }}
      >
        {company.logoUrl && (
          <img src={company.logoUrl} alt="Logo" className="h-10 object-contain mx-auto mb-2" style={{ filter: 'brightness(0) invert(1)' }} />
        )}
        <h2 className="text-xl font-bold">{company.lines[0]}</h2>
        <p className="text-xs opacity-80 mt-1">{company.lines.slice(1).join(' • ')}</p>
      </div>
      <div className="flex justify-between items-end mb-4">
        <h1 className="text-2xl font-semibold uppercase tracking-wide" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        <div>{extraTitleContent}</div>
      </div>
    </>
  );
}

// ── Minimal: Ultra-clean, thin accent line ──
function MinimalHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div className="border-t-2 pt-6 mb-4" style={{ borderColor: template.accentColor }}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-light text-gray-800">{company.lines[0]}</h2>
            <p className="text-xs text-gray-400 mt-1">{company.lines.slice(1).join(' | ')}</p>
          </div>
          <LogoOrPlaceholder logoUrl={company.logoUrl} />
        </div>
      </div>
      <div className="mb-4">
        <h1 className="text-xl font-light uppercase tracking-[0.3em] text-gray-400">
          {documentTitle}
        </h1>
        {extraTitleContent}
      </div>
    </>
  );
}

// ── Sidebar: Colored vertical bar on left edge ──
function SidebarHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 max-w-md">
          <CompanyLines lines={company.lines} color={template.primaryColor} />
        </div>
        <LogoOrPlaceholder logoUrl={company.logoUrl} />
      </div>
      <div className="text-right mb-3">
        <h1 className="text-3xl font-bold uppercase" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        {extraTitleContent}
      </div>
    </>
  );
}

// ── Elegant: Double-line borders, decorative ──
function ElegantHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div className="border-t-4 border-b pt-4 pb-4 mb-4" style={{ borderColor: template.primaryColor }}>
        <div className="border-t pt-2 mt-1" style={{ borderColor: template.primaryColor + '40' }}>
          <div className="flex justify-between items-start">
            <div className="flex-1 max-w-md">
              <CompanyLines lines={company.lines} color={template.primaryColor} />
            </div>
            <LogoOrPlaceholder logoUrl={company.logoUrl} />
          </div>
        </div>
      </div>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-normal tracking-widest uppercase italic" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        {extraTitleContent}
      </div>
    </>
  );
}

// ── Split: Two-column header card ──
function SplitHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div
        className="flex items-center gap-4 p-4 rounded-lg mb-4 border"
        style={{ borderColor: template.primaryColor + '30', backgroundColor: template.secondaryColor }}
      >
        <LogoOrPlaceholder logoUrl={company.logoUrl} />
        <div className="flex-1">
          <CompanyLines lines={company.lines} color={template.primaryColor} />
        </div>
      </div>
      <div className="flex justify-between items-end mb-4">
        <h1 className="text-2xl font-semibold uppercase tracking-wide" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        <div>{extraTitleContent}</div>
      </div>
    </>
  );
}

// ── Bold Banner: Large dark header with oversized title ──
function BoldBannerHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div
        className="rounded-lg p-6 mb-4"
        style={{ backgroundColor: template.primaryColor, color: 'white' }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="text-sm opacity-80">
            {company.lines.map((line, idx) => (
              <p key={idx} className={idx === 0 ? 'font-semibold text-white' : ''}>{line}</p>
            ))}
          </div>
          {company.logoUrl && (
            <img src={company.logoUrl} alt="Logo" className="h-12 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          )}
        </div>
        <h1 className="text-4xl font-black uppercase tracking-wide">{documentTitle}</h1>
        {extraTitleContent && <div className="mt-2">{extraTitleContent}</div>}
      </div>
    </>
  );
}

// ── Gradient: Gradient accent bar under header ──
function GradientHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 max-w-md">
          <CompanyLines lines={company.lines} color={template.primaryColor} />
        </div>
        <LogoOrPlaceholder logoUrl={company.logoUrl} />
      </div>
      <div
        className="h-2 rounded-full mb-4"
        style={{ background: `linear-gradient(90deg, ${template.primaryColor}, ${template.accentColor}, transparent)` }}
      />
      <div className="text-right mb-3">
        <h1 className="text-3xl font-light tracking-widest uppercase" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        {extraTitleContent}
      </div>
    </>
  );
}

// ── Boxed: Rounded bordered sections ──
function BoxedHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div className="rounded-xl border-2 p-4 mb-4" style={{ borderColor: template.primaryColor + '30' }}>
        <div className="flex justify-between items-start">
          <div className="flex-1 max-w-md">
            <CompanyLines lines={company.lines} color={template.primaryColor} />
          </div>
          <LogoOrPlaceholder logoUrl={company.logoUrl} />
        </div>
      </div>
      <div className="rounded-xl border-2 p-3 mb-4 text-center" style={{ borderColor: template.accentColor + '20', backgroundColor: template.secondaryColor }}>
        <h1 className="text-2xl font-semibold uppercase tracking-wide" style={{ color: template.primaryColor }}>
          {documentTitle}
        </h1>
        {extraTitleContent}
      </div>
    </>
  );
}

// ── Contrast: Dark header with bright accent highlights ──
function ContrastHeader({ template, company, documentTitle, fields, extraTitleContent }: DocumentHeaderProps) {
  return (
    <>
      <div
        className="rounded-lg p-5 mb-4"
        style={{ backgroundColor: template.primaryColor, color: 'white' }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">{company.lines[0]}</h2>
            <p className="text-xs opacity-60 mt-1">{company.lines.slice(1).join(' • ')}</p>
          </div>
          {company.logoUrl && (
            <img src={company.logoUrl} alt="Logo" className="h-12 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          )}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <div className="h-1 w-8 rounded" style={{ backgroundColor: template.accentColor }} />
          <h1 className="text-2xl font-bold uppercase tracking-wider">{documentTitle}</h1>
        </div>
        {extraTitleContent && <div className="mt-1">{extraTitleContent}</div>}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// Main renderer dispatcher
// ──────────────────────────────────────────────

export function DocumentHeader(props: DocumentHeaderProps) {
  const headerMap: Record<HeaderStyle, React.FC<DocumentHeaderProps>> = {
    classic: ClassicHeader,
    modern: ModernHeader,
    minimal: MinimalHeader,
    sidebar: SidebarHeader,
    elegant: ElegantHeader,
    split: SplitHeader,
    'bold-banner': BoldBannerHeader,
    gradient: GradientHeader,
    boxed: BoxedHeader,
    contrast: ContrastHeader,
  };

  const HeaderComponent = headerMap[props.template.headerStyle] || ClassicHeader;
  return <HeaderComponent {...props} />;
}

// ──────────────────────────────────────────────
// Document Wrapper (adds sidebar bar for sidebar layout)
// ──────────────────────────────────────────────

interface DocumentWrapperProps {
  template: DocumentTemplate;
  fontFamily: string;
  children: React.ReactNode;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export function DocumentWrapper({ template, fontFamily, children, innerRef }: DocumentWrapperProps) {
  const baseStyle: React.CSSProperties = {
    fontFamily,
    width: '210mm',
    minHeight: '297mm',
    fontSize: '10pt',
    lineHeight: '1.4',
    color: '#1a1a1a',
  };

  if (template.headerStyle === 'sidebar') {
    return (
      <div ref={innerRef} className="bg-white shadow-lg mx-auto flex" style={baseStyle}>
        <div className="w-2 flex-shrink-0" style={{ backgroundColor: template.primaryColor }} />
        <div className="flex-1 p-[15mm]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div ref={innerRef} className="bg-white shadow-lg mx-auto" style={{ ...baseStyle, padding: '15mm' }}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// Client Info Section
// ──────────────────────────────────────────────

interface ClientSectionProps {
  template: DocumentTemplate;
  label: string;
  children: React.ReactNode; // client name, address, etc.
  fields: DocumentField[];
}

export function ClientInfoSection({ template, label, children, fields }: ClientSectionProps) {
  if (template.headerStyle === 'boxed') {
    return (
      <div className="rounded-xl border-2 p-4 mb-4" style={{ borderColor: template.primaryColor + '15' }}>
        <div className="flex justify-between items-start">
          <div className="leading-tight">
            <p className="text-sm font-semibold mb-1" style={{ color: template.primaryColor }}>{label}</p>
            {children}
          </div>
          <FieldsBlock fields={fields} color={template.primaryColor} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-end mb-4">
      <div className="leading-tight">
        <p className="text-sm font-semibold mb-1" style={{ color: template.primaryColor }}>{label}</p>
        {children}
      </div>
      <FieldsBlock fields={fields} color={template.primaryColor} />
    </div>
  );
}

// ──────────────────────────────────────────────
// Table Styling Helpers
// ──────────────────────────────────────────────

export function getTableHeaderStyle(template: DocumentTemplate): React.CSSProperties {
  if (template.headerStyle === 'minimal') {
    return {
      backgroundColor: 'transparent',
      color: template.accentColor,
      borderBottom: `2px solid ${template.accentColor}`,
    };
  }
  if (template.headerStyle === 'contrast') {
    return {
      backgroundColor: template.primaryColor,
      color: template.accentColor,
    };
  }
  return {
    backgroundColor: template.primaryColor,
    color: 'white',
  };
}

export function getTableRowStyle(template: DocumentTemplate, index: number): React.CSSProperties {
  switch (template.tableStyle) {
    case 'striped':
      return {
        backgroundColor: index % 2 === 0 ? template.secondaryColor : 'white',
      };
    case 'bordered':
      return {
        borderBottom: '1px solid #ddd',
      };
    case 'clean':
      return {
        borderBottom: '1px solid #eee',
      };
    default:
      return {};
  }
}

// ──────────────────────────────────────────────
// Totals Section
// ──────────────────────────────────────────────

interface TotalsSectionProps {
  template: DocumentTemplate;
  children: React.ReactNode;
}

export function TotalsSection({ template, children }: TotalsSectionProps) {
  if (template.headerStyle === 'boxed') {
    return (
      <div className="flex justify-end mb-8">
        <div className="w-64 rounded-xl border-2 p-4" style={{ borderColor: template.primaryColor + '20' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-8">
      <div className="w-64">
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Footer Section
// ──────────────────────────────────────────────

interface FooterProps {
  template: DocumentTemplate;
  footerText?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

export function DocumentFooter({ template, footerText, phone, email, website }: FooterProps) {
  if (template.headerStyle === 'contrast') {
    return (
      <div className="mt-8 pt-4 rounded-lg p-3 text-center" style={{ backgroundColor: template.primaryColor, color: 'white' }}>
        <p className="text-xs opacity-80">{footerText || 'Thank you for your business!'}</p>
        <div className="flex justify-center gap-4 mt-1 text-xs opacity-60">
          {phone && <span>Tel: {phone}</span>}
          {email && <span>Email: {email}</span>}
          {website && <span>Web: {website}</span>}
        </div>
      </div>
    );
  }

  if (template.headerStyle === 'elegant') {
    return (
      <div className="mt-8 border-t-4 border-b pt-3 pb-2 text-center" style={{ borderColor: template.primaryColor }}>
        <div className="border-t pt-1" style={{ borderColor: template.primaryColor + '40' }}>
          <p className="text-xs" style={{ color: template.accentColor }}>{footerText || 'Thank you for your business!'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-4 text-center border-t" style={{ borderColor: '#e5e5e5' }}>
      <p className="text-xs" style={{ color: template.accentColor }}>{footerText || 'Thank you for your business!'}</p>
      {(phone || email || website) && (
        <div className="flex justify-center gap-4 mt-2 text-xs" style={{ color: template.accentColor }}>
          {phone && <span>Tel: {phone}</span>}
          {email && <span>Email: {email}</span>}
          {website && <span>Web: {website}</span>}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Description/Scope Section
// ──────────────────────────────────────────────

interface DescriptionSectionProps {
  template: DocumentTemplate;
  title: string;
  children: React.ReactNode;
}

export function DescriptionSection({ template, title, children }: DescriptionSectionProps) {
  if (template.headerStyle === 'boxed') {
    return (
      <div className="mb-6 rounded-xl border-2 p-4" style={{ borderColor: template.primaryColor + '15' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: template.accentColor }}>
          {title}
        </h3>
        {children}
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded" style={{ backgroundColor: template.secondaryColor }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: template.accentColor }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// Section Label Helper
// ──────────────────────────────────────────────

interface SectionLabelProps {
  template: DocumentTemplate;
  children: React.ReactNode;
}

export function SectionLabel({ template, children }: SectionLabelProps) {
  return (
    <h4 className="text-sm font-semibold mb-2" style={{ color: template.primaryColor }}>
      {children}
    </h4>
  );
}

// ──────────────────────────────────────────────
// Helper: build template from profile settings
// ──────────────────────────────────────────────

export function buildTemplateFromProfile(profile: {
  template_primary_color?: string | null;
  template_secondary_color?: string | null;
  template_accent_color?: string | null;
  template_font_family?: string | null;
  template_header_style?: string | null;
  template_table_style?: string | null;
} | null, fallback: DocumentTemplate): DocumentTemplate {
  if (!profile?.template_primary_color) return fallback;

  return {
    id: 'custom',
    name: 'Custom',
    primaryColor: profile.template_primary_color,
    secondaryColor: profile.template_secondary_color || 'hsl(230, 25%, 95%)',
    accentColor: profile.template_accent_color || 'hsl(230, 35%, 25%)',
    fontFamily: profile.template_font_family ? `'${profile.template_font_family}', sans-serif` : fallback.fontFamily,
    headerStyle: (profile.template_header_style as HeaderStyle) || 'classic',
    tableStyle: (profile.template_table_style as 'striped' | 'bordered' | 'clean') || 'striped',
  };
}

// Helper to build company info from profile
export function buildCompanyInfo(profile: {
  company_name: string;
  header_info?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  registration_number?: string | null;
  vat_enabled?: boolean | null;
  vat_number?: string | null;
  logo_url?: string | null;
} | null): CompanyInfo {
  if (!profile) return { lines: ['Company Name'], logoUrl: null };

  if (profile.header_info) {
    return { lines: profile.header_info.split('\n'), logoUrl: profile.logo_url };
  }

  const lines = [profile.company_name];
  if (profile.address_line_1) lines.push(profile.address_line_1);
  if (profile.address_line_2) lines.push(profile.address_line_2);
  if (profile.city || profile.postal_code) {
    lines.push([profile.city, profile.postal_code].filter(Boolean).join(', '));
  }
  if (profile.country) lines.push(profile.country);
  if (profile.phone) lines.push(`Tel: ${profile.phone}`);
  if (profile.email) lines.push(`Email: ${profile.email}`);
  if (profile.registration_number) lines.push(`IBR NO: ${profile.registration_number}`);
  if (profile.vat_enabled && profile.vat_number) lines.push(`TIN NO: ${profile.vat_number}`);

  return { lines, logoUrl: profile.logo_url };
}
