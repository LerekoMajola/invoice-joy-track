import { MapPin } from 'lucide-react';
import southernAfricaMap from '@/assets/southern-africa-map.svg';

const countries = [
  { name: 'Lesotho', flag: '🇱🇸' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Botswana', flag: '🇧🇼' },
  { name: 'eSwatini', flag: '🇸🇿' },
  { name: 'Namibia', flag: '🇳🇦' },
];

export function Coverage() {
  return (
    <section className="py-20 bg-[hsl(220,25%,8%)] relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MapPin className="h-4 w-4" />
            Where We Operate
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Available Across Southern Africa
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Orion is proudly serving businesses in five Southern African countries — and growing.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Map */}
          <div className="relative flex items-center justify-center">
            <img
              src={southernAfricaMap}
              alt="Map of Southern Africa highlighting Lesotho, South Africa, Botswana, eSwatini, and Namibia"
              className="w-full max-w-md rounded-2xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Country list */}
          <div className="space-y-4">
            {countries.map((country, i) => (
              <div
                key={country.name}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="text-3xl">{country.flag}</span>
                <span className="text-white text-lg font-medium">{country.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
