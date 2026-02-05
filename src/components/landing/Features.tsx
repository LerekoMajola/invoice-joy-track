import { 
  FileText, 
  Receipt, 
  Truck, 
  Users, 
  TrendingUp, 
  CheckSquare,
  Briefcase,
  Settings,
  Shield,
  Smartphone
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Professional Quotes',
    description: 'Create beautiful, branded quotes in minutes. Track status and convert to invoices with one click.',
    gradient: 'from-primary to-violet',
  },
  {
    icon: Receipt,
    title: 'Invoice Management',
    description: 'Generate invoices, track payments, and manage your cash flow with ease.',
    gradient: 'from-violet to-coral',
  },
  {
    icon: Truck,
    title: 'Delivery Notes',
    description: 'Create and manage delivery notes. Link them to invoices for complete order tracking.',
    gradient: 'from-coral to-warning',
  },
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Manage clients and leads in one place. Track interactions and grow relationships.',
    gradient: 'from-info to-cyan',
  },
  {
    icon: TrendingUp,
    title: 'Profitability Tracking',
    description: 'See your profit margins on every job. Make data-driven pricing decisions.',
    gradient: 'from-success to-accent',
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Stay organized with built-in task tracking. Never miss a deadline.',
    gradient: 'from-accent to-cyan',
  },
  {
    icon: Briefcase,
    title: 'Tender Management',
    description: 'Track tenders and RFQs. Manage your bid pipeline effectively.',
    gradient: 'from-primary to-info',
  },
  {
    icon: Settings,
    title: 'Customizable Templates',
    description: 'Brand your documents with your logo, colors, and custom terms.',
    gradient: 'from-violet to-primary',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and stored securely. Only you can access your business information.',
    gradient: 'from-success to-info',
  },
  {
    icon: Smartphone,
    title: 'Works on Any Device',
    description: 'Access your business from desktop, tablet, or phone. Work from anywhere.',
    gradient: 'from-cyan to-violet',
  }
];

export function Features() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From quotes to invoices, client management to profitability tracking — 
            all the tools you need in one simple platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient}`} />
              
              <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="relative font-display text-xl font-bold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="relative text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
