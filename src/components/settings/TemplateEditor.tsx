import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ColorPicker } from '@/components/ui/color-picker';
import { FontSelector } from './FontSelector';
import { Palette, LayoutTemplate } from 'lucide-react';

interface TemplateSettings {
  template_primary_color: string;
  template_secondary_color: string;
  template_accent_color: string;
  template_font_family: string;
  template_font_url: string | null;
  template_header_style: string;
  template_table_style: string;
}

interface TemplateEditorProps {
  value: TemplateSettings;
  onChange: (field: keyof TemplateSettings, value: string | null) => void;
}

// Preset templates
const PRESET_TEMPLATES = [
  {
    id: 'navy-professional',
    name: 'Navy Professional',
    primary: 'hsl(230, 35%, 18%)',
    secondary: 'hsl(230, 25%, 95%)',
    accent: 'hsl(230, 35%, 25%)',
    font: 'DM Sans',
    header: 'classic',
    table: 'striped',
  },
  {
    id: 'emerald-modern',
    name: 'Emerald Modern',
    primary: 'hsl(160, 84%, 25%)',
    secondary: 'hsl(160, 50%, 96%)',
    accent: 'hsl(160, 60%, 35%)',
    font: 'Inter',
    header: 'modern',
    table: 'clean',
  },
  {
    id: 'slate-minimal',
    name: 'Slate Minimal',
    primary: 'hsl(215, 25%, 27%)',
    secondary: 'hsl(215, 15%, 96%)',
    accent: 'hsl(215, 20%, 40%)',
    font: 'Inter',
    header: 'minimal',
    table: 'bordered',
  },
  {
    id: 'royal-blue',
    name: 'Royal Blue',
    primary: 'hsl(221, 83%, 40%)',
    secondary: 'hsl(221, 50%, 96%)',
    accent: 'hsl(221, 70%, 50%)',
    font: 'DM Sans',
    header: 'modern',
    table: 'striped',
  },
  {
    id: 'burgundy-classic',
    name: 'Burgundy Classic',
    primary: 'hsl(345, 50%, 30%)',
    secondary: 'hsl(345, 30%, 96%)',
    accent: 'hsl(345, 45%, 40%)',
    font: 'Georgia',
    header: 'classic',
    table: 'bordered',
  },
];

function generateFontUrl(fontFamily: string): string {
  const encodedFamily = fontFamily.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;500;600;700&display=swap`;
}

export function TemplateEditor({ value, onChange }: TemplateEditorProps) {
  // Load selected font
  useEffect(() => {
    if (value.template_font_url) {
      const existingLink = document.querySelector(`link[href="${value.template_font_url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = value.template_font_url;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, [value.template_font_url]);

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    onChange('template_primary_color', preset.primary);
    onChange('template_secondary_color', preset.secondary);
    onChange('template_accent_color', preset.accent);
    onChange('template_font_family', preset.font);
    onChange('template_font_url', generateFontUrl(preset.font));
    onChange('template_header_style', preset.header);
    onChange('template_table_style', preset.table);
  };

  const handleFontChange = (fontFamily: string, fontUrl: string) => {
    onChange('template_font_family', fontFamily);
    onChange('template_font_url', fontUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Document Template
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your quotes, invoices, and delivery notes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Templates */}
        <div className="space-y-3">
          <Label>Quick Presets</Label>
          <div className="grid grid-cols-5 gap-2">
            {PRESET_TEMPLATES.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                className="h-auto py-3 flex flex-col gap-2"
                onClick={() => applyPreset(preset)}
              >
                <div
                  className="h-6 w-full rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <span className="text-xs truncate w-full">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Color Customization */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base">Colors</Label>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ColorPicker
              label="Primary Color"
              value={value.template_primary_color}
              onChange={(color) => onChange('template_primary_color', color)}
            />
            <ColorPicker
              label="Secondary Color"
              value={value.template_secondary_color}
              onChange={(color) => onChange('template_secondary_color', color)}
            />
            <ColorPicker
              label="Accent Color"
              value={value.template_accent_color}
              onChange={(color) => onChange('template_accent_color', color)}
            />
          </div>
        </div>

        {/* Font Customization */}
        <FontSelector
          value={value.template_font_family}
          fontUrl={value.template_font_url}
          onChange={handleFontChange}
        />

        {/* Style Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base">Style Options</Label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="header_style">Header Style</Label>
              <Select
                value={value.template_header_style}
                onValueChange={(val) => onChange('template_header_style', val)}
              >
                <SelectTrigger id="header_style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic - Traditional professional look</SelectItem>
                  <SelectItem value="modern">Modern - Clean contemporary design</SelectItem>
                  <SelectItem value="minimal">Minimal - Simple and elegant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="table_style">Table Style</Label>
              <Select
                value={value.template_table_style}
                onValueChange={(val) => onChange('template_table_style', val)}
              >
                <SelectTrigger id="table_style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="striped">Striped - Alternating row colors</SelectItem>
                  <SelectItem value="bordered">Bordered - Full cell borders</SelectItem>
                  <SelectItem value="clean">Clean - Minimal lines only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-3">
          <Label>Preview</Label>
          <div
            className="rounded-lg border overflow-hidden"
            style={{ fontFamily: `'${value.template_font_family}', sans-serif` }}
          >
            {/* Header Preview */}
            <div
              className="p-4"
              style={{
                backgroundColor: value.template_primary_color,
                color: 'white',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Company Name</h3>
                  <p className="text-sm opacity-80">123 Business Street</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">QUOTATION</p>
                  <p className="text-xs opacity-80">#QT-001</p>
                </div>
              </div>
            </div>
            
            {/* Table Preview */}
            <div className="p-4" style={{ backgroundColor: value.template_secondary_color }}>
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: value.template_table_style === 'bordered' ? '1px solid #ccc' : undefined,
                    }}
                  >
                    <th className="text-left py-2" style={{ color: value.template_accent_color }}>Item</th>
                    <th className="text-right py-2" style={{ color: value.template_accent_color }}>Qty</th>
                    <th className="text-right py-2" style={{ color: value.template_accent_color }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    style={{
                      backgroundColor: value.template_table_style === 'striped' ? 'rgba(0,0,0,0.03)' : undefined,
                      borderBottom: value.template_table_style === 'bordered' ? '1px solid #eee' : undefined,
                    }}
                  >
                    <td className="py-2">Sample Item 1</td>
                    <td className="text-right py-2">2</td>
                    <td className="text-right py-2">M 500.00</td>
                  </tr>
                  <tr
                    style={{
                      borderBottom: value.template_table_style !== 'clean' ? '1px solid #eee' : undefined,
                    }}
                  >
                    <td className="py-2">Sample Item 2</td>
                    <td className="text-right py-2">1</td>
                    <td className="text-right py-2">M 750.00</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 pt-3 border-t text-right">
                <span className="font-bold" style={{ color: value.template_primary_color }}>
                  Total: M 1,250.00
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
