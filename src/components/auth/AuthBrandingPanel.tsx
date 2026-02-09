import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { Quote } from 'lucide-react';

const industries = ['Business', 'Workshop', 'School', 'Legal', 'Tool Hire'];

export function AuthBrandingPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-violet/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />

      <div className="relative max-w-md text-center animate-slide-up">
        <div className="flex items-center justify-center mb-8 animate-bounce-in">
          <PlatformLogo className="h-32 w-auto rounded-3xl p-8 bg-white shadow-sm" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-4">
          One Platform, Five Industries
        </h2>
        <p className="text-white/70 text-lg">
          Business operations, workshop management, school admin, legal practice, and equipment hire — all in one powerful modular platform.
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
          {industries.map((ind, index) => (
            <span
              key={ind}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm font-medium animate-slide-up"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              {ind}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
