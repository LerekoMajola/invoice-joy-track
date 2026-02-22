import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { Quote, Briefcase, Scale, Dumbbell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testimonials } from '@/data/testimonials';

const industries = [
  { label: 'BizPro', icon: Briefcase, color: 'bg-indigo-500/80' },
  { label: 'LawPro', icon: Scale, color: 'bg-emerald-500/80' },
  { label: 'GymPro', icon: Dumbbell, color: 'bg-lime-500/80' },
];

export function AuthBrandingPanel() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[currentTestimonial];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-violet/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-coral/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl" />

      <div className="relative max-w-md text-center animate-slide-up">
        <Link to="/" className="flex items-center justify-center mb-8 animate-bounce-in">
          <PlatformLogo className="h-32 w-32 rounded-2xl p-6 bg-white shadow-sm object-contain" />
        </Link>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            One Platform, Three Solutions
          </h2>
          <p className="text-white/70 text-lg">
            BizPro, LawPro &amp; GymPro — modular business management for companies, law firms, and fitness centres.
          </p>

        {/* Rotating Testimonial */}
        <div
          key={currentTestimonial}
          className={`mt-8 ${t.accentColor} backdrop-blur-sm rounded-2xl p-6 text-left animate-slide-up`}
        >
          <div className="flex items-center justify-between mb-2">
            <Quote className="h-5 w-5 text-white/40" />
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white/50">{t.product}</span>
          </div>
          <p className="text-white/80 text-sm italic leading-relaxed">
            "{t.quote}"
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              {t.initials}
            </div>
            <div>
              <p className="text-white/90 text-sm font-medium">{t.name}</p>
              <p className="text-white/50 text-xs">{t.role}</p>
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-4">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTestimonial(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTestimonial ? 'w-4 bg-white/80' : 'w-1.5 bg-white/30'}`}
            />
          ))}
        </div>

        {/* Trusted by badge */}
        <div className="mt-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <p className="text-white/60 text-sm">
            Trusted by <span className="text-white font-semibold">5 000+</span> organisations
          </p>
        </div>

        {/* Industry pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
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
