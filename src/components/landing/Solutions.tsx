import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  GraduationCap, 
  BookOpen, 
  Wallet, 
  Megaphone,
  Receipt,
  Users,
  CheckSquare,
  UserPlus,
  Calculator
} from 'lucide-react';

const features = [
  { icon: GraduationCap, label: 'Student Records', description: 'Complete student profiles with guardian information and academic history.' },
  { icon: BookOpen, label: 'Class Management', description: 'Organise classes, assign teachers, and manage academic terms effortlessly.' },
  { icon: Wallet, label: 'Fee Tracking', description: 'Set fee schedules per term and class, track payments, and monitor outstanding balances.' },
  { icon: Receipt, label: 'Fee Invoicing', description: 'Generate professional invoices for school fees and send them to parents.' },
  { icon: Megaphone, label: 'Announcements', description: 'Communicate with parents and staff through targeted announcements by class.' },
  { icon: Users, label: 'Guardian Profiles', description: 'Maintain detailed guardian contact information linked to each student.' },
  { icon: CheckSquare, label: 'Task Management', description: 'Keep track of administrative tasks, deadlines, and staff assignments.' },
  { icon: UserPlus, label: 'Staff & HR', description: 'Manage teachers and staff records, contracts, and payroll information.' },
  { icon: Calculator, label: 'Accounting', description: 'Financial overview with income tracking, expense management, and reports.' },
];

export function Solutions() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-info to-cyan text-white text-sm font-medium mb-4">
            <GraduationCap className="h-4 w-4" />
            Built for Private Schools
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything Your School Needs
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From student enrolment to fee collection — manage every aspect of your school 
            with tools designed specifically for African private schools and academies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.label}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br from-info to-cyan" />
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-info to-cyan flex items-center justify-center mb-4 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="relative font-semibold text-foreground mb-2">{feature.label}</h3>
              <p className="relative text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/auth">
            <Button variant="outline" className="rounded-xl group">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
