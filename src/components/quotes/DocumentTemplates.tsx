import { Check } from 'lucide-react';

export interface DocumentTemplate {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: 'classic' | 'modern' | 'minimal';
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
    tableStyle: 'bordered',
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    primaryColor: 'hsl(221, 83%, 40%)',
    secondaryColor: 'hsl(221, 50%, 96%)',
    accentColor: 'hsl(221, 70%, 50%)',
    fontFamily: "'DM Sans', sans-serif",
    headerStyle: 'modern',
    tableStyle: 'striped',
  },
  {
    id: 'burgundy-classic',
    name: 'Burgundy Classic',
    primaryColor: 'hsl(345, 50%, 30%)',
    secondaryColor: 'hsl(345, 30%, 96%)',
    accentColor: 'hsl(345, 45%, 40%)',
    fontFamily: "'Georgia', serif",
    headerStyle: 'classic',
    tableStyle: 'bordered',
  },
];

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
          className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
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
          <div
            className="h-8 w-full rounded mb-2"
            style={{ backgroundColor: template.primaryColor }}
          />
          <p className="text-xs font-medium text-center truncate">{template.name}</p>
        </button>
      ))}
    </div>
  );
}
