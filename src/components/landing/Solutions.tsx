import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  FileText, 
  Receipt, 
  Users, 
  TrendingUp, 
  CheckSquare, 
  Truck,
  Wrench, 
  Car, 
  ClipboardList, 
  Cog,
  GraduationCap, 
  BookOpen, 
  Wallet, 
  Megaphone,
  Briefcase
} from 'lucide-react';

const solutions = [
  {
    id: 'business',
    title: 'Business Management',
    subtitle: 'For service companies, contractors & SMEs',
    description: 'Professional quotes, invoices, delivery notes, client management, and profitability tracking — everything you need to run a service-based business.',
    gradient: 'from-primary to-violet',
    glowClass: 'shadow-glow-primary',
    features: [
      { icon: FileText, label: 'Professional Quotes' },
      { icon: Receipt, label: 'Invoice Management' },
      { icon: Truck, label: 'Delivery Notes' },
      { icon: Users, label: 'Client CRM' },
      { icon: TrendingUp, label: 'Profitability Tracking' },
      { icon: CheckSquare, label: 'Task Management' },
      { icon: Briefcase, label: 'Tender Management' },
    ],
  },
  {
    id: 'workshop',
    title: 'Workshop Management',
    subtitle: 'For auto workshops & repair centres',
    description: 'Built around the real workshop workflow: vehicle check-in, diagnosis, quoting, parts & labour tracking, and invoicing — all from one job card.',
    gradient: 'from-coral to-warning',
    glowClass: 'shadow-glow-coral',
    features: [
      { icon: ClipboardList, label: 'Job Cards' },
      { icon: Car, label: 'Vehicle Tracking' },
      { icon: Wrench, label: 'Diagnosis & Repair' },
      { icon: Cog, label: 'Parts & Labour' },
      { icon: FileText, label: 'Quote from Job Card' },
      { icon: Receipt, label: 'Invoice from Actuals' },
    ],
  },
  {
    id: 'school',
    title: 'School Management',
    subtitle: 'For private schools & academies',
    description: 'Manage student records, track school fees, organise classes and terms, and communicate with parents — designed for private schools in Africa.',
    gradient: 'from-info to-cyan',
    glowClass: '',
    features: [
      { icon: GraduationCap, label: 'Student Records' },
      { icon: BookOpen, label: 'Class Management' },
      { icon: Wallet, label: 'Fee Tracking' },
      { icon: Megaphone, label: 'Announcements' },
      { icon: Receipt, label: 'Fee Invoicing' },
      { icon: Users, label: 'Guardian Profiles' },
    ],
  },
];

export function Solutions() {
  return (
    <section id="solutions" className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            One Platform, Three Powerful Systems
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you run a service business, an auto workshop, or a private school — 
            we have the tools built specifically for your industry.
          </p>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {solutions.map((solution, solutionIndex) => (
            <div
              key={solution.id}
              className={`flex flex-col ${solutionIndex % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 lg:gap-16 items-center animate-slide-up`}
              style={{ animationDelay: `${solutionIndex * 100}ms` }}
            >
              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${solution.gradient} text-white text-sm font-medium`}>
                  {solution.features[0] && (() => { const Icon = solution.features[0].icon; return <Icon className="h-4 w-4" />; })()}
                  {solution.subtitle}
                </div>

                <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  {solution.title}
                </h3>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {solution.description}
                </p>

                <Link to="/auth">
                  <Button variant="outline" className="rounded-xl group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Feature Grid */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {solution.features.map((feature, featureIndex) => (
                    <div
                      key={feature.label}
                      className="group p-4 rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up relative overflow-hidden"
                      style={{ animationDelay: `${solutionIndex * 100 + featureIndex * 50}ms` }}
                    >
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${solution.gradient}`} />
                      <div className={`relative w-10 h-10 rounded-xl bg-gradient-to-br ${solution.gradient} flex items-center justify-center mb-3 text-white shadow-md transition-transform duration-300 group-hover:scale-110`}>
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <p className="relative font-medium text-sm text-foreground">
                        {feature.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
