import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

// Convert HSL string to HSL object
function parseHsl(hslString: string): { h: number; s: number; l: number } {
  const match = hslString.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (match) {
    return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) };
  }
  // Default to a navy color if parsing fails
  return { h: 230, s: 35, l: 18 };
}

// Convert HSL object to HSL string
function toHslString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// Convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert Hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hsl, setHsl] = useState(() => parseHsl(value));
  const [hexInput, setHexInput] = useState(() => hslToHex(hsl.h, hsl.s, hsl.l));
  const wheelRef = useRef<HTMLCanvasElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const parsed = parseHsl(value);
    setHsl(parsed);
    setHexInput(hslToHex(parsed.h, parsed.s, parsed.l));
  }, [value]);

  // Draw the color wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = canvas.width;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 8;
    
    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Draw the hue wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `hsl(${angle}, 0%, ${hsl.l}%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, ${hsl.l}%)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    
    // Draw the selected color indicator
    const angleRad = (hsl.h - 90) * Math.PI / 180;
    const satRadius = (hsl.s / 100) * radius;
    const indicatorX = centerX + satRadius * Math.cos(angleRad);
    const indicatorY = centerY + satRadius * Math.sin(angleRad);
    
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(indicatorX, indicatorY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [hsl]);

  const handleWheelInteraction = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    
    const radius = canvas.width / 2 - 8;
    const distance = Math.min(Math.sqrt(x * x + y * y), radius);
    
    let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    
    const saturation = (distance / radius) * 100;
    
    const newHsl = { h: angle, s: saturation, l: hsl.l };
    setHsl(newHsl);
    setHexInput(hslToHex(newHsl.h, newHsl.s, newHsl.l));
    onChange(toHslString(newHsl.h, newHsl.s, newHsl.l));
  }, [hsl.l, onChange]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    handleWheelInteraction(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    handleWheelInteraction(e);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleLightnessChange = (l: number) => {
    const newHsl = { ...hsl, l };
    setHsl(newHsl);
    setHexInput(hslToHex(newHsl.h, newHsl.s, newHsl.l));
    onChange(toHslString(newHsl.h, newHsl.s, newHsl.l));
  };

  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex)) {
      const newHsl = hexToHsl(hex);
      setHsl(newHsl);
      onChange(toHslString(newHsl.h, newHsl.s, newHsl.l));
    }
  };

  const currentHex = hslToHex(hsl.h, hsl.s, hsl.l);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-10"
          >
            <div
              className="w-6 h-6 rounded border border-border"
              style={{ backgroundColor: currentHex }}
            />
            <span className="font-mono text-sm">{currentHex.toUpperCase()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-4" align="start">
          <div className="space-y-4">
            {/* Color Wheel */}
            <div className="flex justify-center">
              <canvas
                ref={wheelRef}
                width={200}
                height={200}
                className="cursor-crosshair rounded-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
            
            {/* Lightness Slider */}
            <div className="space-y-2">
              <Label className="text-xs">Lightness: {Math.round(hsl.l)}%</Label>
              <div className="relative h-4 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, 
                      hsl(${hsl.h}, ${hsl.s}%, 0%), 
                      hsl(${hsl.h}, ${hsl.s}%, 50%), 
                      hsl(${hsl.h}, ${hsl.s}%, 100%))`
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => handleLightnessChange(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow pointer-events-none"
                  style={{ left: `calc(${hsl.l}% - 8px)`, backgroundColor: currentHex }}
                />
              </div>
            </div>
            
            {/* Hex Input */}
            <div className="space-y-2">
              <Label className="text-xs">Hex Color</Label>
              <Input
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
                className="font-mono"
              />
            </div>
            
            {/* HSL Display */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <span className="text-muted-foreground">H:</span> {Math.round(hsl.h)}°
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <span className="text-muted-foreground">S:</span> {Math.round(hsl.s)}%
              </div>
              <div className="text-center p-2 bg-muted rounded">
                <span className="text-muted-foreground">L:</span> {Math.round(hsl.l)}%
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
