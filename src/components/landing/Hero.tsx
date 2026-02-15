import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Wrench, GraduationCap, Scale, Hammer, Hotel } from 'lucide-react';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

const industries = [
  { icon: Briefcase, label: 'Business', gradient: 'from-primary to-violet' },
  { icon: Wrench, label: 'Workshop', gradient: 'from-coral to-warning' },
  { icon: GraduationCap, label: 'School', gradient: 'from-info to-cyan' },
  { icon: Scale, label: 'Legal', gradient: 'from-violet to-primary' },
  { icon: Hammer, label: 'Tool Hire', gradient: 'from-success to-info' },
  { icon: Hotel, label: 'Guest House', gradient: 'from-rose-500 to-pink-500' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-info/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <PlatformLogo className="h-40 w-40 rounded-full p-8 bg-white shadow-lg object-contain" />
          <nav className="hidden md:flex items-center gap-6">
            <a href="#solutions" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Solutions
            </a>
            <a href="#features" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Pricing
            </a>
            <Link to="/about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="py-20 lg:py-32 text-center">
          {/* 5 floating industry icons */}
          <div className="flex justify-center gap-4 sm:gap-6 mb-10 animate-slide-up">
            {industries.map((ind, i) => (
              <div
                key={ind.label}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${ind.gradient} flex items-center justify-center text-white shadow-lg animate-float`}
                style={{ animationDelay: `${i * 0.4}s` }}
                title={ind.label}
              >
                <ind.icon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
            ))}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
            One Platform,
            <br />
            <span className="bg-gradient-to-r from-cyan via-accent to-coral bg-clip-text text-transparent">Every Industry</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Business operations, workshop management, school admin, legal practice, 
            equipment hire, and guest house hospitality — all powered by one modular platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-accent to-success hover:opacity-90 text-white px-8 py-6 text-lg rounded-2xl shadow-glow-success hover:shadow-lg transition-all duration-300 hover:scale-105">
                Start 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/20 px-8 py-6 text-lg rounded-2xl">
                View Pricing
              </Button>
            </a>
          </div>

          <p className="text-white/50 text-sm mt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            No credit card required · 7-day free trial · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
