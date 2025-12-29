import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Check, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FontSelectorProps {
  value: string;
  fontUrl: string | null;
  onChange: (fontFamily: string, fontUrl: string) => void;
}

interface GoogleFont {
  family: string;
  category: string;
  variants?: string[];
}

// Popular fonts for quick selection
const POPULAR_FONTS = [
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Source Sans Pro', category: 'sans-serif' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Georgia', category: 'serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Ubuntu', category: 'sans-serif' },
  { family: 'Oswald', category: 'sans-serif' },
  { family: 'Rubik', category: 'sans-serif' },
  { family: 'Work Sans', category: 'sans-serif' },
  { family: 'Quicksand', category: 'sans-serif' },
  { family: 'Crimson Text', category: 'serif' },
];

function generateFontUrl(fontFamily: string): string {
  const encodedFamily = fontFamily.replace(/ /g, '+');
  return `https://fonts.googleapis.com/css2?family=${encodedFamily}:wght@400;500;600;700&display=swap`;
}

export function FontSelector({ value, fontUrl, onChange }: FontSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleFont[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());

  // Load font for preview
  const loadFont = (fontFamily: string) => {
    if (loadedFonts.has(fontFamily)) return;
    
    const link = document.createElement('link');
    link.href = generateFontUrl(fontFamily);
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    setLoadedFonts(prev => new Set([...prev, fontFamily]));
  };

  // Load popular fonts on mount
  useEffect(() => {
    POPULAR_FONTS.slice(0, 10).forEach(font => loadFont(font.family));
  }, []);

  // Search Google Fonts API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Filter popular fonts by search query
        const filtered = POPULAR_FONTS.filter(font =>
          font.family.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        // Also search additional fonts from Google Fonts
        const response = await fetch(
          `https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBwIX97bVWr3-6AIUvGkcNnmFgirefZ6Sw&sort=popularity`
        );
        
        if (response.ok) {
          const data = await response.json();
          const googleFonts = data.items
            .filter((font: GoogleFont) =>
              font.family.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .slice(0, 20);
          
          // Merge with popular fonts, avoiding duplicates
          const merged = [...filtered];
          googleFonts.forEach((font: GoogleFont) => {
            if (!merged.find(f => f.family === font.family)) {
              merged.push({ family: font.family, category: font.category });
            }
          });
          
          setSearchResults(merged.slice(0, 20));
          merged.slice(0, 10).forEach(font => loadFont(font.family));
        } else {
          setSearchResults(filtered);
        }
      } catch (error) {
        // Fallback to filtering popular fonts
        const filtered = POPULAR_FONTS.filter(font =>
          font.family.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectFont = (fontFamily: string) => {
    loadFont(fontFamily);
    const url = generateFontUrl(fontFamily);
    onChange(fontFamily, url);
  };

  const fontsToDisplay = searchQuery.trim() ? searchResults : POPULAR_FONTS;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Font Family</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Google Fonts..."
            className="pl-10"
          />
        </div>
      </div>

      {/* Current Selection */}
      <div className="p-3 rounded-lg border bg-muted/50">
        <div className="flex items-center gap-2 mb-2">
          <Type className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Selected Font</span>
        </div>
        <p
          className="text-2xl"
          style={{ fontFamily: `'${value}', sans-serif` }}
        >
          {value}
        </p>
        <p
          className="text-sm text-muted-foreground mt-1"
          style={{ fontFamily: `'${value}', sans-serif` }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      {/* Font List */}
      <ScrollArea className="h-[200px] rounded-lg border">
        <div className="p-2 space-y-1">
          {fontsToDisplay.map((font) => (
            <Button
              key={font.family}
              variant="ghost"
              className={cn(
                "w-full justify-between h-auto py-3 px-3",
                value === font.family && "bg-primary/10"
              )}
              onClick={() => handleSelectFont(font.family)}
              onMouseEnter={() => loadFont(font.family)}
            >
              <div className="text-left">
                <p
                  className="text-base font-normal"
                  style={{ fontFamily: `'${font.family}', ${font.category}` }}
                >
                  {font.family}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {font.category}
                </p>
              </div>
              {value === font.family && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </Button>
          ))}
          {isSearching && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!isSearching && searchQuery && fontsToDisplay.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No fonts found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
