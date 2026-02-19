import { MapPin } from 'lucide-react';

const countries = [
  { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'eSwatini', flag: '🇸🇿' },
  { name: 'Namibia', flag: '🇳🇦' },
];

export function Coverage() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 text-primary text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Where We Operate
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Available Across Southern Africa
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Orion is proudly serving businesses in five Southern African countries — and growing.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {countries.map((country, i) => (
            <div
              key={country.name}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background/80 border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow animate-slide-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="text-5xl">{country.flag}</span>
              <span className="text-foreground text-sm font-semibold">{country.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
