import React from 'react';
import { Check } from 'lucide-react';

export type HeaderStyle = 'classic' | 'modern' | 'minimal' | 'sidebar' | 'elegant' | 'split' | 'bold-banner' | 'gradient' | 'boxed' | 'contrast';

export interface DocumentTemplate {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: HeaderStyle;
  tableStyle: 'striped' | 'bordered' | 'clean';
}

export const templates: DocumentTemplate[] = [
  {
    id: 'navy-professional',
    name: 'Navy Professional',
    primaryColor: 'hsl(230, 35%, 18%)',
    secondaryColor: 'hsl(230, 25%, 95%)',
    accentColor: 'hsl(230, 35%, 25%)',
    fontFamily: "'DM Sans', sans-serif",
    headerStyle: 'classic',
    tableStyle: 'striped',
  },
  {
    id: 'emerald-modern',
    name: 'Emerald Modern',
    primaryColor: 'hsl(160, 84%, 25%)',
    secondaryColor: 'hsl(160, 50%, 96%)',
    accentColor: 'hsl(160, 60%, 35%)',
    fontFamily: "'Inter', sans-serif",
    headerStyle: 'modern',
    tableStyle: 'clean',
  },
  {
    id: 'slate-minimal',
    name: 'Slate Minimal',
    primaryColor: 'hsl(215, 25%, 27%)',
    secondaryColor: 'hsl(215, 15%, 96%)',
    accentColor: 'hsl(215, 20%, 40%)',
    fontFamily: "'Inter', sans-serif",
    headerStyle: 'minimal',
    tableStyle: 'clean',
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    primaryColor: 'hsl(221, 83%, 40%)',
    secondaryColor: 'hsl(221, 50%, 96%)',
    accentColor: 'hsl(221, 70%, 50%)',
    fontFamily: "'DM Sans', sans-serif",
    headerStyle: 'sidebar',
    tableStyle: 'striped',
  },
  {
    id: 'burgundy-classic',
    name: 'Burgundy Classic',
    primaryColor: 'hsl(345, 50%, 30%)',
    secondaryColor: 'hsl(345, 30%, 96%)',
    accentColor: 'hsl(345, 45%, 40%)',
    fontFamily: "'Georgia', serif",
    headerStyle: 'elegant',
    tableStyle: 'bordered',
  },
  {
    id: 'teal-corporate',
    name: 'Teal Corporate',
    primaryColor: 'hsl(180, 50%, 28%)',
    secondaryColor: 'hsl(180, 30%, 96%)',
    accentColor: 'hsl(180, 45%, 38%)',
    fontFamily: "'DM Sans', sans-serif",
    headerStyle: 'split',
    tableStyle: 'striped',
  },
  {
    id: 'charcoal-bold',
    name: 'Charcoal Bold',
    primaryColor: 'hsl(210, 10%, 20%)',
    secondaryColor: 'hsl(210, 10%, 96%)',
    accentColor: 'hsl(210, 15%, 35%)',
    fontFamily: "'Inter', sans-serif",
    headerStyle: 'bold-banner',
    tableStyle: 'clean',
  },
  {
    id: 'sunset-warm',
    name: 'Sunset Warm',
    primaryColor: 'hsl(20, 70%, 40%)',
    secondaryColor: 'hsl(30, 60%, 97%)',
    accentColor: 'hsl(15, 65%, 50%)',
    fontFamily: "'DM Sans', sans-serif",
    headerStyle: 'gradient',
    tableStyle: 'striped',
  },
  {
    id: 'forest-executive',
    name: 'Forest Executive',
    primaryColor: 'hsl(150, 40%, 25%)',
    secondaryColor: 'hsl(150, 25%, 96%)',
    accentColor: 'hsl(150, 35%, 35%)',
    fontFamily: "'Georgia', serif",
    headerStyle: 'boxed',
    tableStyle: 'bordered',
  },
  {
    id: 'midnight-contrast',
    name: 'Midnight Contrast',
    primaryColor: 'hsl(240, 30%, 15%)',
    secondaryColor: 'hsl(240, 20%, 96%)',
    accentColor: 'hsl(45, 90%, 55%)',
    fontFamily: "'Inter', sans-serif",
    headerStyle: 'contrast',
    tableStyle: 'clean',
  },
];

// Layout thumbnail mini-previews for the selector
const layoutThumbnails: Record<HeaderStyle, React.ReactNode> = {
  classic: (
    <div className="space-y-0.5">
      <div className="flex justify-between"><div className="w-6 h-1.5 bg-current opacity-60 rounded-sm" /><div className="w-3 h-3 border border-current opacity-40 rounded-sm" /></div>
      <div className="w-4 h-1 bg-current opacity-30 rounded-sm ml-auto" />
      <div className="w-full h-0.5 bg-current opacity-20 mt-1" />
    </div>
  ),
  modern: (
    <div className="space-y-0.5">
      <div className="w-full h-3 bg-current opacity-60 rounded-sm flex items-center justify-center"><div className="w-4 h-1 bg-white rounded-sm opacity-80" /></div>
      <div className="w-full h-0.5 bg-current opacity-20 mt-1" />
    </div>
  ),
  minimal: (
    <div className="space-y-0.5">
      <div className="w-full h-0.5 bg-current opacity-40" />
      <div className="flex justify-between mt-1"><div className="w-5 h-1 bg-current opacity-30 rounded-sm" /><div className="w-3 h-1 bg-current opacity-20 rounded-sm" /></div>
      <div className="w-full h-0.5 bg-current opacity-10 mt-1" />
    </div>
  ),
  sidebar: (
    <div className="flex gap-0.5">
      <div className="w-1 h-8 bg-current opacity-60 rounded-sm" />
      <div className="flex-1 space-y-0.5">
        <div className="w-5 h-1 bg-current opacity-30 rounded-sm" />
        <div className="w-3 h-1 bg-current opacity-20 rounded-sm" />
        <div className="w-full h-0.5 bg-current opacity-15 mt-1" />
      </div>
    </div>
  ),
  elegant: (
    <div className="space-y-0.5">
      <div className="w-full h-0.5 bg-current opacity-40" />
      <div className="w-full h-0.5 bg-current opacity-20 mt-px" />
      <div className="flex justify-between mt-1"><div className="w-5 h-1 bg-current opacity-30 rounded-sm" /><div className="w-3 h-1 bg-current opacity-20 rounded-sm" /></div>
      <div className="w-full h-0.5 bg-current opacity-40 mt-1" />
      <div className="w-full h-0.5 bg-current opacity-20 mt-px" />
    </div>
  ),
  split: (
    <div className="space-y-0.5">
      <div className="flex gap-1 p-0.5 border border-current opacity-40 rounded-sm">
        <div className="w-3 h-3 border border-current opacity-30 rounded-sm" />
        <div className="flex-1 space-y-0.5 mt-0.5"><div className="w-full h-0.5 bg-current opacity-40 rounded-sm" /><div className="w-3/4 h-0.5 bg-current opacity-20 rounded-sm" /></div>
      </div>
      <div className="w-full h-0.5 bg-current opacity-15 mt-1" />
    </div>
  ),
  'bold-banner': (
    <div className="space-y-0.5">
      <div className="w-full h-4 bg-current opacity-70 rounded-sm flex items-end p-0.5"><div className="w-6 h-1.5 bg-white rounded-sm opacity-80" /></div>
      <div className="w-full h-0.5 bg-current opacity-15 mt-1" />
    </div>
  ),
  gradient: (
    <div className="space-y-0.5">
      <div className="flex justify-between"><div className="w-5 h-1 bg-current opacity-30 rounded-sm" /><div className="w-3 h-3 border border-current opacity-30 rounded-sm" /></div>
      <div className="w-full h-1 rounded-sm mt-1" style={{ background: 'linear-gradient(90deg, currentColor, transparent)', opacity: 0.4 }} />
      <div className="w-full h-0.5 bg-current opacity-15 mt-1" />
    </div>
  ),
  boxed: (
    <div className="space-y-1">
      <div className="border border-current opacity-30 rounded p-0.5"><div className="w-4 h-1 bg-current opacity-40 rounded-sm" /></div>
      <div className="border border-current opacity-20 rounded p-0.5"><div className="w-full h-0.5 bg-current opacity-30 rounded-sm" /></div>
    </div>
  ),
  contrast: (
    <div className="space-y-0.5">
      <div className="w-full h-3 bg-current opacity-80 rounded-sm flex items-center justify-between px-0.5">
        <div className="w-4 h-0.5 bg-white rounded-sm opacity-60" />
        <div className="w-1.5 h-1.5 border border-yellow-400 rounded-sm opacity-80" />
      </div>
      <div className="w-full h-0.5 bg-current opacity-15 mt-1" />
    </div>
  ),
};

interface TemplateSelectorProps {
  selectedTemplate: DocumentTemplate;
  onSelectTemplate: (template: DocumentTemplate) => void;
}

export function TemplateSelector({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) {
  const [previewTemplate, setPreviewTemplate] = React.useState<DocumentTemplate | null>(null);

  return (
    <div className="space-y-4">
      {/* Template Grid */}
      <div className="grid grid-cols-5 gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            onMouseEnter={() => setPreviewTemplate(template)}
            onMouseLeave={() => setPreviewTemplate(null)}
            className={`relative p-2.5 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedTemplate.id === template.id
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-muted-foreground/30'
            }`}
          >
            {selectedTemplate.id === template.id && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                <Check className="h-3 w-3" />
              </div>
            )}
            {/* Layout thumbnail */}
            <div
              className="h-10 w-full rounded mb-1.5 p-1"
              style={{ backgroundColor: template.primaryColor + '15', color: template.primaryColor }}
            >
              {layoutThumbnails[template.headerStyle]}
            </div>
            {/* Color swatch */}
            <div
              className="h-2 w-full rounded-full mb-1.5"
              style={{ backgroundColor: template.primaryColor }}
            />
            <p className="text-[10px] font-medium text-center truncate leading-tight">{template.name}</p>
          </button>
        ))}
      </div>

      {/* Hover Preview */}
      {previewTemplate && (
        <div className="border rounded-lg overflow-hidden bg-white" style={{ maxHeight: '260px' }}>
          <div className="origin-top-left" style={{ width: '210mm', transform: 'scale(0.22)', transformOrigin: 'top left', pointerEvents: 'none' }}>
            <TemplateMiniDoc template={previewTemplate} />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline mini document for hover preview in the popover
function TemplateMiniDoc({ template }: { template: DocumentTemplate }) {
  return (
    <div style={{ fontFamily: template.fontFamily, padding: '15mm', backgroundColor: 'white', width: '210mm', fontSize: '10pt', lineHeight: '1.4', color: '#1a1a1a' }}>
      {/* Header area based on style */}
      <TemplateHeaderPreview template={template} />
      {/* Mini table */}
      <div className="mb-6">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={getPreviewHeaderStyle(template)}>
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold w-16">#</th>
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wider font-semibold">Description</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wider font-semibold w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {['Web Design & Development', 'Logo & Branding', 'SEO Setup'].map((item, i) => (
              <tr key={i} style={getPreviewRowStyle(template, i)}>
                <td className="py-3 px-4 text-sm text-gray-600">{i + 1}</td>
                <td className="py-3 px-4 text-sm text-gray-900">{item}</td>
                <td className="py-3 px-4 text-sm text-right text-gray-900 font-medium">M {(8500 - i * 2500).toLocaleString()}.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <div className="w-64 text-sm">
          <div className="flex justify-between pt-2 border-t text-base font-bold" style={{ color: template.primaryColor }}>
            <span>Total</span><span>M 15,500.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPreviewHeaderStyle(template: DocumentTemplate): React.CSSProperties {
  if (template.headerStyle === 'minimal') return { backgroundColor: 'transparent', color: template.accentColor, borderBottom: `2px solid ${template.accentColor}` };
  if (template.headerStyle === 'contrast') return { backgroundColor: template.primaryColor, color: template.accentColor };
  return { backgroundColor: template.primaryColor, color: 'white' };
}

function getPreviewRowStyle(template: DocumentTemplate, index: number): React.CSSProperties {
  switch (template.tableStyle) {
    case 'striped': return { backgroundColor: index % 2 === 0 ? template.secondaryColor : 'white' };
    case 'bordered': return { borderBottom: '1px solid #ddd' };
    default: return { borderBottom: '1px solid #eee' };
  }
}

function TemplateHeaderPreview({ template }: { template: DocumentTemplate }) {
  const pc = template.primaryColor;
  const sc = template.secondaryColor;
  const ac = template.accentColor;
  const companyName = 'Acme Solutions (Pty) Ltd';
  const companyDetail = '14 Main Street, Maseru';

  switch (template.headerStyle) {
    case 'modern':
      return (
        <>
          <div className="rounded-lg p-6 mb-4 text-center" style={{ backgroundColor: pc, color: 'white' }}>
            <h2 className="text-xl font-bold">{companyName}</h2>
            <p className="text-xs opacity-80 mt-1">{companyDetail}</p>
          </div>
          <h1 className="text-2xl font-semibold uppercase tracking-wide mb-4" style={{ color: pc }}>Quotation</h1>
        </>
      );
    case 'minimal':
      return (
        <>
          <div className="border-t-2 pt-6 mb-4" style={{ borderColor: ac }}>
            <h2 className="text-lg font-light text-gray-800">{companyName}</h2>
            <p className="text-xs text-gray-400 mt-1">{companyDetail}</p>
          </div>
          <h1 className="text-xl font-light uppercase tracking-[0.3em] text-gray-400 mb-4">Quotation</h1>
        </>
      );
    case 'sidebar':
      return (
        <>
          <div className="flex justify-between items-start mb-3">
            <div><h2 className="text-xl font-bold" style={{ color: pc }}>{companyName}</h2><p className="text-sm text-gray-600">{companyDetail}</p></div>
          </div>
          <h1 className="text-3xl font-bold uppercase text-right mb-3" style={{ color: pc }}>Quotation</h1>
        </>
      );
    case 'elegant':
      return (
        <>
          <div className="border-t-4 border-b pt-4 pb-4 mb-4" style={{ borderColor: pc }}>
            <div className="border-t pt-2 mt-1" style={{ borderColor: pc + '40' }}>
              <h2 className="text-xl font-bold" style={{ color: pc }}>{companyName}</h2>
              <p className="text-sm text-gray-600">{companyDetail}</p>
            </div>
          </div>
          <h1 className="text-2xl font-normal tracking-widest uppercase italic text-center mb-4" style={{ color: pc }}>Quotation</h1>
        </>
      );
    case 'split':
      return (
        <>
          <div className="flex items-center gap-4 p-4 rounded-lg mb-4 border" style={{ borderColor: pc + '30', backgroundColor: sc }}>
            <div><h2 className="text-xl font-bold" style={{ color: pc }}>{companyName}</h2><p className="text-sm text-gray-600">{companyDetail}</p></div>
          </div>
          <h1 className="text-2xl font-semibold uppercase tracking-wide mb-4" style={{ color: pc }}>Quotation</h1>
        </>
      );
    case 'bold-banner':
      return (
        <div className="rounded-lg p-6 mb-4" style={{ backgroundColor: pc, color: 'white' }}>
          <p className="text-sm opacity-80 mb-4">{companyName} • {companyDetail}</p>
          <h1 className="text-4xl font-black uppercase tracking-wide">Quotation</h1>
        </div>
      );
    case 'gradient':
      return (
        <>
          <div className="flex justify-between items-start mb-2">
            <div><h2 className="text-xl font-bold" style={{ color: pc }}>{companyName}</h2><p className="text-sm text-gray-600">{companyDetail}</p></div>
          </div>
          <div className="h-2 rounded-full mb-4" style={{ background: `linear-gradient(90deg, ${pc}, ${ac}, transparent)` }} />
          <h1 className="text-3xl font-light tracking-widest uppercase text-right mb-3" style={{ color: pc }}>Quotation</h1>
        </>
      );
    case 'boxed':
      return (
        <>
          <div className="rounded-xl border-2 p-4 mb-4" style={{ borderColor: pc + '30' }}>
            <h2 className="text-xl font-bold" style={{ color: pc }}>{companyName}</h2>
            <p className="text-sm text-gray-600">{companyDetail}</p>
          </div>
          <div className="rounded-xl border-2 p-3 mb-4 text-center" style={{ borderColor: ac + '20', backgroundColor: sc }}>
            <h1 className="text-2xl font-semibold uppercase tracking-wide" style={{ color: pc }}>Quotation</h1>
          </div>
        </>
      );
    case 'contrast':
      return (
        <div className="rounded-lg p-5 mb-4" style={{ backgroundColor: pc, color: 'white' }}>
          <h2 className="text-lg font-bold">{companyName}</h2>
          <p className="text-xs opacity-60 mt-1">{companyDetail}</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-1 w-8 rounded" style={{ backgroundColor: ac }} />
            <h1 className="text-2xl font-bold uppercase tracking-wider">Quotation</h1>
          </div>
        </div>
      );
    default: // classic
      return (
        <>
          <div className="flex justify-between items-start mb-3">
            <div><h2 className="text-xl font-bold" style={{ color: pc }}>{companyName}</h2><p className="text-sm text-gray-600">{companyDetail}</p></div>
          </div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-right mb-3" style={{ color: pc }}>Quotation</h1>
        </>
      );
  }
}
