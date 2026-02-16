import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { Quote, Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel, Car, Dumbbell } from 'lucide-react';

const industries = [
  { label: 'BizPro', icon: Briefcase, color: 'bg-indigo-500/80' },
  { label: 'ShopPro', icon: Wrench, color: 'bg-orange-500/80' },
  { label: 'EduPro', icon: GraduationCap, color: 'bg-cyan-500/80' },
  { label: 'LawPro', icon: Scale, color: 'bg-emerald-500/80' },
  { label: 'HirePro', icon: Hammer, color: 'bg-amber-500/80' },
  { label: 'StayPro', icon: Hotel, color: 'bg-rose-500/80' },
  { label: 'FleetPro', icon: Car, color: 'bg-slate-500/80' },
  { label: 'GymPro', icon: Dumbbell, color: 'bg-lime-500/80' },
];

export function AuthBrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-violet/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />

      <div className="relative max-w-md text-center animate-slide-up">
        <div className="flex items-center justify-center mb-8 animate-bounce-in">
          <PlatformLogo className="h-32 w-32 rounded-full p-6 bg-white shadow-sm object-contain" />
        </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            One Platform, Eight Industries
          </h2>
          <p className="text-white/70 text-lg">
            BizPro, ShopPro, EduPro, LawPro, HirePro, StayPro, FleetPro &amp; GymPro — all powered by one modular platform.
          </p>

        {/* Testimonial */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Quote className="h-5 w-5 text-white/40 mb-2" />
          <p className="text-white/80 text-sm italic leading-relaxed">
            "This platform completely transformed how we handle quotes and invoices. We saved hours every week and our clients love the professional documents."
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              TM
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">Thabo M.</p>
              <p className="text-white/50 text-xs">Operations Manager</p>
            </div>
          </div>
        </div>

        {/* Trusted by badge */}
        <div className="mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-white/60 text-sm">
            Trusted by <span className="text-white font-semibold">5 000+</span> organisations
          </p>
        </div>

        {/* Industry pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {industries.map((ind, index) => {
            const Icon = ind.icon;
            return (
              <span
                key={ind.label}
                className={`inline-flex items-center gap-1.5 px-4 py-2 ${ind.color} backdrop-blur-sm rounded-full text-white text-sm font-medium animate-slide-up`}
                style={{ animationDelay: `${0.4 + index * 0.08}s` }}
              >
                <Icon className="h-3.5 w-3.5" />
                {ind.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
