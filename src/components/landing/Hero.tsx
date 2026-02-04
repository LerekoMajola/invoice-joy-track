import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Receipt, Users, TrendingUp } from 'lucide-react';
import leekayLogo from '@/assets/leekay-logo.png';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sidebar-background via-sidebar-background to-sidebar-accent">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <div className="bg-white rounded-lg px-4 py-2">
            <img src={leekayLogo} alt="Leekay" className="h-8 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Content */}
        <div className="py-24 lg:py-36 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
            Run Your Business
            <br />
            <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Professional quotes, invoices, delivery notes, and client management — 
            all in one powerful platform designed for businesses in Lesotho.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium">
                Start 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-white/40 text-sm">No credit card required</p>
          </div>

          {/* Feature Icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { icon: FileText, label: 'Quotes' },
              { icon: Receipt, label: 'Invoices' },
              { icon: Users, label: 'CRM' },
              { icon: TrendingUp, label: 'Profitability' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-3 text-white/60 group">
                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
