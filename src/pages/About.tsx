import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { Footer } from '@/components/landing/Footer';
import { useGeoPricing, formatGeoPrice } from '@/hooks/useGeoPricing';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowRight,
  Briefcase,
  Wrench,
  GraduationCap,
  Scale,
  Hammer,
  Hotel,
  CheckCircle2,
  FileText,
  Users,
  BarChart3,
  Target,
  ListTodo,
  Palette,
  Smartphone,
  Cloud,
  Shield,
  Lock,
} from 'lucide-react';

const industries = [
  {
    icon: Briefcase,
    name: 'Business Management',
    system: 'business',
    gradient: 'from-primary to-violet',
    description: 'Complete operations suite for companies, freelancers, and professional service providers.',
    features: ['Quotes & Estimates', 'Invoices & Receipts', 'Client CRM & Pipeline', 'Delivery Notes', 'Tender Management', 'Profitability Tracking'],
    basePrice: 350,
  },
  {
    icon: Wrench,
    name: 'Workshop & Repairs',
    system: 'workshop',
    gradient: 'from-coral to-warning',
    description: 'Manage job cards, track parts and labour, and keep full vehicle history for every customer.',
    features: ['Job Cards & Progress Tracking', 'Parts & Labour Costing', 'Vehicle History Records', 'Technician Assignment', 'Quote-to-Invoice Flow', 'Workshop Dashboard'],
    basePrice: 450,
  },
  {
    icon: GraduationCap,
    name: 'School Administration',
    system: 'school',
    gradient: 'from-info to-cyan',
    description: 'Simplify student records, fee collection, class management, and parent communication.',
    features: ['Student Records & Enrolment', 'Fee Tracking & Invoicing', 'Class & Term Management', 'Timetable Scheduling', 'Announcements', 'Fee Reports & Analytics'],
    basePrice: 720,
  },
  {
    icon: Scale,
    name: 'Legal Practice',
    system: 'legal',
    gradient: 'from-violet to-primary',
    description: 'Case management, billable time tracking, court calendars, and conflict checking for law firms.',
    features: ['Case & Matter Management', 'Billable Time Tracking', 'Court Calendar & Reminders', 'Legal Document Storage', 'Conflict-of-Interest Checks', 'Case-Based Invoicing'],
    basePrice: 500,
  },
  {
    icon: Hammer,
    name: 'Tool & Equipment Hire',
    system: 'hire',
    gradient: 'from-success to-info',
    description: 'Equipment catalogues, hire orders, availability calendars, and damage tracking for rental companies.',
    features: ['Equipment Catalogue', 'Hire Orders & Returns', 'Availability Calendar', 'Damage & Condition Tracking', 'Deposit Management', 'Hire Reports'],
    basePrice: 400,
  },
  {
    icon: Hotel,
    name: 'Guest House & Hospitality',
    system: 'guesthouse',
    gradient: 'from-rose-500 to-pink-500',
    description: 'Room management, booking calendars, housekeeping tasks, and guest reviews for lodges and B&Bs.',
    features: ['Room Management', 'Booking Calendar', 'Housekeeping Tasks', 'Guest Reviews & Ratings', 'Meal Plan Tracking', 'Occupancy Reports'],
    basePrice: 650,
  },
];

const coreFeatures = [
  { icon: FileText, name: 'Invoicing & Quotes', description: 'Professional, branded PDFs with customisable templates, tax support, and payment tracking.' },
  { icon: Users, name: 'Staff & Payroll', description: 'Manage employees, generate payslips, track leave, and control role-based access.' },
  { icon: BarChart3, name: 'Accounting', description: 'Income statements, balance sheets, VAT reports, bank reconciliation, and expense tracking.' },
  { icon: Target, name: 'CRM & Sales Pipeline', description: 'Track leads, manage deals through pipeline stages, and forecast revenue.' },
  { icon: ListTodo, name: 'Task Management', description: 'Assign tasks, set priorities and deadlines, track progress with calendar and list views.' },
  { icon: Palette, name: 'Document Branding', description: 'Upload your logo, choose fonts and colours, and produce documents that match your brand.' },
];

const techHighlights = [
  { icon: Smartphone, name: 'Progressive Web App', description: 'Install on any device. Works offline with automatic sync when reconnected.' },
  { icon: Cloud, name: 'Cloud-Based', description: 'Access from anywhere. Automatic backups and updates with zero maintenance.' },
  { icon: Shield, name: '256-bit SSL Encryption', description: 'Bank-level security for all data in transit and at rest.' },
  { icon: Lock, name: 'Role-Based Access', description: 'Control who sees what with staff accounts and granular permissions.' },
];

export default function About() {
  const { symbol, rate, loading, currency } = useGeoPricing();

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <PlatformLogo className="h-10 w-auto rounded-lg p-1.5 bg-white shadow-sm" />
            <span className="font-display font-bold text-white text-lg hidden sm:inline">Orion Labs</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl text-sm">
                Home
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl text-sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-white text-primary hover:bg-white/90 rounded-xl shadow-lg text-sm">
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-info/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-coral/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            About <span className="bg-gradient-to-r from-cyan via-accent to-coral bg-clip-text text-transparent">Orion Labs</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            The modular cloud platform that powers businesses, workshops, schools, law firms, rental companies, and guest houses across Africa.
          </p>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6 text-center">
            What Is Orion Labs?
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground text-center">
            <p className="text-lg leading-relaxed">
              Orion Labs is a single, modular platform designed to run your entire operation — no matter your industry. 
              Instead of juggling separate tools for invoicing, payroll, CRM, and accounting, you get one unified system 
              with industry-specific modules built in. Choose the vertical that matches your business, pick a package tier, 
              and you're up and running in minutes.
            </p>
            <p className="text-lg leading-relaxed mt-4">
              Built as a Progressive Web App, Orion Labs works on any device — desktop, tablet, or mobile — and even works offline. 
              It's designed for the African market with Maloti (LSL) currency support, local tax compliance, and pricing that makes sense for businesses of every size.
            </p>
          </div>
        </div>
      </section>

      {/* Industry Solutions */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-violet text-white text-sm font-medium mb-4">
              6 Industries, 1 Platform
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Industry Solutions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each solution comes with tailored modules, shared core features, and a 7-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((ind, index) => (
              <div
                key={ind.system}
                className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`bg-gradient-to-br ${ind.gradient} p-6 text-white`}>
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                    <ind.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{ind.name}</h3>
                   <p className="text-white/70 text-sm mt-1">
                     {loading ? <Skeleton className="h-4 w-20 bg-white/20" /> : `from ${formatGeoPrice(ind.basePrice, symbol, rate)}/mo`}
                   </p>
                </div>
                <div className="flex-1 p-6">
                  <p className="text-sm text-muted-foreground mb-4">{ind.description}</p>
                  <ul className="space-y-2">
                    {ind.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 pt-0">
                  <Link to={`/auth?system=${ind.system}`}>
                    <Button variant="outline" className="w-full rounded-xl group/btn">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Core Platform Features
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every Orion Labs subscription includes these powerful shared capabilities.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feat) => (
              <div key={feat.name} className="flex gap-4 p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">{feat.name}</h3>
                  <p className="text-sm text-muted-foreground">{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Security */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Built for Reliability & Security
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade technology that works everywhere, on every device.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techHighlights.map((tech) => (
              <div key={tech.name} className="text-center p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <tech.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{tech.name}</h3>
                <p className="text-sm text-muted-foreground">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Overview */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Pricing at a Glance
            </h2>
            <p className="text-lg text-muted-foreground">
              All plans include a 7-day free trial. No credit card required.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-6 py-4 font-display font-semibold text-foreground">Industry</th>
                  <th className="text-right px-6 py-4 font-display font-semibold text-foreground">Starting From</th>
                </tr>
              </thead>
              <tbody>
                {industries.map((ind, i) => (
                  <tr key={ind.system} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ind.gradient} flex items-center justify-center text-white`}>
                        <ind.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{ind.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground">
                      {loading ? <Skeleton className="h-4 w-20 ml-auto" /> : `${formatGeoPrice(ind.basePrice, symbol, rate)}/mo`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-center mt-10">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-accent to-success hover:opacity-90 text-white px-10 py-6 text-lg rounded-2xl shadow-glow-success hover:shadow-lg transition-all duration-300 hover:scale-105">
                Start Your 7-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-muted-foreground text-sm mt-4">
              No credit card required · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
