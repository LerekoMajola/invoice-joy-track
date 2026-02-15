import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'LS', name: 'Lesotho', dial: '+266', flag: '🇱🇸' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'BW', name: 'Botswana', dial: '+267', flag: '🇧🇼' },
  { code: 'SZ', name: 'Eswatini', dial: '+268', flag: '🇸🇿' },
  { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿' },
  { code: 'NA', name: 'Namibia', dial: '+264', flag: '🇳🇦' },
  { code: 'ZW', name: 'Zimbabwe', dial: '+263', flag: '🇿🇼' },
  { code: 'ZM', name: 'Zambia', dial: '+260', flag: '🇿🇲' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
];

// Sort by dial code length descending so longer codes match first
const COUNTRIES_BY_DIAL = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

function detectCountryFromValue(value: string): Country | null {
  if (!value || !value.startsWith('+')) return null;
  for (const country of COUNTRIES_BY_DIAL) {
    if (value.startsWith(country.dial)) {
      return country;
    }
  }
  return null;
}

function stripNonDigits(str: string): string {
  return str.replace(/\D/g, '');
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  defaultCountry?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  placeholder,
  defaultCountry = 'LS',
  className,
  disabled = false,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Determine selected country and local number from value
  const { selectedCountry, localNumber } = useMemo(() => {
    const detected = detectCountryFromValue(value);
    if (detected) {
      const local = value.slice(detected.dial.length);
      return { selectedCountry: detected, localNumber: local };
    }
    const fallback = COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0];
    return { selectedCountry: fallback, localNumber: stripNonDigits(value) };
  }, [value, defaultCountry]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleLocalChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = stripNonDigits(e.target.value);
      onChange(digits ? `${selectedCountry.dial}${digits}` : '');
    },
    [selectedCountry, onChange]
  );

  const handleCountrySelect = useCallback(
    (country: Country) => {
      const digits = localNumber;
      onChange(digits ? `${country.dial}${digits}` : '');
      setOpen(false);
      setSearch('');
    },
    [localNumber, onChange]
  );

  // Format local number for display (group digits)
  const displayNumber = useMemo(() => {
    if (!localNumber) return '';
    const digits = localNumber;
    // Simple grouping: chunks of 4
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }, [localNumber]);

  const defaultPlaceholder = placeholder || (selectedCountry.code === 'LS' ? '5800 1234' : 'Phone number');

  return (
    <div className={cn('flex', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="flex items-center gap-1 rounded-r-none border-r-0 px-2.5 h-10 min-w-[90px] justify-between shrink-0"
            type="button"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-sm text-muted-foreground">{selectedCountry.dial}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0 z-50" align="start">
          <div className="flex items-center border-b px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-1">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
                    country.code === selectedCountry.code && 'bg-accent'
                  )}
                  onClick={() => handleCountrySelect(country)}
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="flex-1 text-left">{country.name}</span>
                  <span className="text-muted-foreground text-xs">{country.dial}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No country found</p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <Input
        type="tel"
        value={displayNumber}
        onChange={handleLocalChange}
        placeholder={defaultPlaceholder}
        disabled={disabled}
        className="rounded-l-none"
      />
    </div>
  );
}
