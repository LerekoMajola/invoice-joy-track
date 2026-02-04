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
    description: 'Create beautiful, branded quotes in minutes. Track status and convert to invoices with one click.'
  },
  {
    icon: Receipt,
    title: 'Invoice Management',
    description: 'Generate invoices, track payments, and manage your cash flow with ease.'
  },
  {
    icon: Truck,
    title: 'Delivery Notes',
    description: 'Create and manage delivery notes. Link them to invoices for complete order tracking.'
  },
  {
    icon: Users,
    title: 'Client CRM',
    description: 'Manage clients and leads in one place. Track interactions and grow relationships.'
  },
  {
    icon: TrendingUp,
    title: 'Profitability Tracking',
    description: 'See your profit margins on every job. Make data-driven pricing decisions.'
  },
  {
    icon: CheckSquare,
    title: 'Task Management',
    description: 'Stay organized with built-in task tracking. Never miss a deadline.'
  },
  {
    icon: Briefcase,
    title: 'Tender Management',
    description: 'Track tenders and RFQs. Manage your bid pipeline effectively.'
  },
  {
    icon: Settings,
    title: 'Customizable Templates',
    description: 'Brand your documents with your logo, colors, and custom terms.'
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and stored securely. Only you can access your business information.'
  },
  {
    icon: Smartphone,
    title: 'Works on Any Device',
    description: 'Access your business from desktop, tablet, or phone. Work from anywhere.'
  }
];

export function Features() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Run Your Business
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From quotes to invoices, client management to profitability tracking — 
            all the tools you need in one simple platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
