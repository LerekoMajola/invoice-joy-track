import { 
  Shield,
  Smartphone,
  Settings,
  Zap,
  Cloud,
  Lock
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Works on Any Device',
    description: 'Access your dashboard from desktop, tablet, or phone. Work from anywhere, anytime.',
    gradient: 'from-cyan to-violet',
  },
  {
    icon: Settings,
    title: 'Fully Customizable',
    description: 'Brand your documents with your logo, colors, and custom terms. Make it yours.',
    gradient: 'from-violet to-primary',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your data is encrypted and stored securely. Only you can access your information.',
    gradient: 'from-success to-info',
  },
  {
    icon: Zap,
    title: 'Modular Pricing',
    description: 'Only pay for what you use. Pick modules à la carte and build your own package.',
    gradient: 'from-coral to-warning',
  },
  {
    icon: Cloud,
    title: 'Cloud-Based',
    description: 'No installations needed. Your data is always backed up and accessible in the cloud.',
    gradient: 'from-primary to-info',
  },
  {
    icon: Lock,
    title: 'Role-Based Access',
    description: 'Control who sees what. Assign staff roles and manage permissions with ease.',
    gradient: 'from-accent to-cyan',
  },
];

export function Features() {
  return (
    <section className="py-20 lg:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Built for the Way You Work
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every system shares a powerful foundation designed for reliability, 
            security, and ease of use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-2xl border border-border bg-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-2 animate-slide-up relative overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
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
