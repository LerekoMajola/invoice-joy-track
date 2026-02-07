import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Wrench, GraduationCap } from 'lucide-react';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

const systems = [
  { icon: Briefcase, label: 'Business Management', gradient: 'from-primary to-violet', pricingHash: '#pricing-business' },
  { icon: Wrench, label: 'Workshop Management', gradient: 'from-coral to-warning', pricingHash: '#pricing-workshop' },
  { icon: GraduationCap, label: 'School Management', gradient: 'from-info to-cyan', pricingHash: '#pricing-school' },
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
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <PlatformLogo className="h-20 w-auto rounded-2xl p-5 bg-white shadow-lg" />
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
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-slide-up">
            One Platform for
            <br />
            <span className="bg-gradient-to-r from-cyan via-accent to-success bg-clip-text text-transparent">Every Industry</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Business operations, workshop management, and school administration — 
            all in one modular platform. Pick the tools you need.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
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

          {/* System Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {systems.map(({ icon: Icon, label, gradient, pricingHash }, index) => (
              <a
                key={label}
                href={pricingHash}
                className="group flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 animate-float"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-white font-medium text-sm">{label}</span>
              </a>
            ))}
          </div>

          <p className="text-white/50 text-sm mt-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            No credit card required · 7-day free trial · Cancel anytime
          </p>
        </div>
      </div>


    </section>
  );
}
