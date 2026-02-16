import { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { testimonials } from '@/data/testimonials';

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => setCurrent(index);
  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  const t = testimonials[current];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Loved Across Industries
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from real businesses using the platform every day.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="max-w-3xl mx-auto">
          <div
            key={current}
            className={`relative bg-gradient-to-br ${t.cardBg} border border-border rounded-3xl p-8 sm:p-10 animate-slide-up`}
          >
            <Quote className="h-10 w-10 text-primary/20 mb-4" />
            <p className="text-foreground text-lg sm:text-xl leading-relaxed italic mb-6">
              "{t.quote}"
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${t.accentColor} flex items-center justify-center text-foreground text-sm font-bold`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.accentColor} text-foreground`}>
                {t.product}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="h-9 w-9 rounded-full border border-border bg-card flex items-center justify-center hover:bg-accent transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
