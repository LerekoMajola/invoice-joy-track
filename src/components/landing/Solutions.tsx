import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Briefcase, 
  Scale, 
  Dumbbell,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';

const industries = [
  {
    icon: Briefcase,
    name: 'BizPro',
    system: 'business',
    gradient: 'from-primary to-violet',
    features: ['Quotes & Invoices', 'Client CRM & Pipeline', 'Delivery Notes', 'Profitability Tracking', 'Workshop, Fleet, Hire & more as add-ons'],
    price: 'M350/mo',
  },
  {
    icon: Scale,
    name: 'LawPro',
    system: 'legal',
    gradient: 'from-violet to-primary',
    features: ['Case Management', 'Time & Billing', 'Court Calendar', 'Legal Documents'],
    price: 'M500/mo',
  },
  {
    icon: Dumbbell,
    name: 'GymPro',
    system: 'gym',
    gradient: 'from-lime-500 to-green-600',
    features: ['Member Management', 'Class Scheduling', 'Attendance Tracking', 'Payment & Billing'],
    price: 'M500/mo',
  },
  {
    icon: GraduationCap,
    name: 'EduPro',
    system: 'school',
    gradient: 'from-cyan-400 to-teal-600',
    features: ['Student Management', 'Fee Tracking & Invoicing', 'Timetable & Scheduling', 'Announcements & Reports'],
    price: 'M720/mo',
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-violet text-white text-sm font-medium mb-4">
            4 Solutions, 1 Platform
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Built for Your Industry
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pick the solution that fits your business. Each comes with tailored modules, 
            shared core features, and a 7-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind, index) => (
            <div
              key={ind.system}
              className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Gradient header */}
              <div className={`bg-gradient-to-br ${ind.gradient} p-6 text-white`}>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <ind.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold">{ind.name}</h3>
                <p className="text-white/70 text-sm mt-1">from {ind.price}</p>
              </div>

              {/* Features */}
              <div className="flex-1 p-6">
                <ul className="space-y-3">
                  {ind.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
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
  );
}
