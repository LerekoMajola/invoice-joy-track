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
  return (
    <div className="grid grid-cols-5 gap-3">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelectTemplate(template)}
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
  );
}
