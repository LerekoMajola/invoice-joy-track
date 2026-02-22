import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlatformLogo } from '@/components/shared/PlatformLogo';
import { Footer } from '@/components/landing/Footer';
import { Shield, Database, Eye, Share2, UserCheck, Cookie, Baby, RefreshCw, Mail } from 'lucide-react';

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: `When you register for an Orion Labs account (BizPro, LawPro, or GymPro), we collect the information you provide, including your name, email address, phone number, company name, and billing details. We also collect usage data such as pages visited, features used, and session duration. Device information — including browser type, operating system, and screen resolution — is collected automatically to optimise your experience.`,
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: `We use your information to deliver and maintain the platform, process payments and subscriptions, send transactional notifications (invoices, reminders, alerts), improve platform features and performance, and communicate important updates. We may also use aggregated, anonymised data to understand usage patterns and enhance our services.`,
  },
  {
    icon: Shield,
    title: 'Data Storage and Security',
    content: `All data is encrypted in transit using 256-bit SSL/TLS and at rest using AES-256 encryption. Our cloud infrastructure is hosted on globally distributed, SOC 2-compliant data centres. Access to production systems is restricted to authorised personnel with multi-factor authentication. We perform regular security audits and automated vulnerability scanning.`,
  },
  {
    icon: Share2,
    title: 'Data Sharing',
    content: `We do not sell, rent, or trade your personal information to third parties. We share data only with trusted service providers who assist in delivering the platform (e.g. email delivery, payment processing, SMS notifications), and only to the extent necessary. We may disclose information if required by law or to protect the rights and safety of our users.`,
  },
  {
    icon: UserCheck,
    title: 'Your Rights',
    content: `You have the right to access, correct, or delete your personal data at any time. You can export your data from the Settings page using the Data Backup feature. To request data deletion, contact us at support@orionlabs.com. We will process requests within 30 days in accordance with applicable data protection regulations, including the Protection of Personal Information Act (POPIA) for South African and Lesotho-based users.`,
  },
  {
    icon: Cookie,
    title: 'Cookies and Tracking',
    content: `Orion Labs uses essential cookies to maintain your authentication session and platform preferences. We do not use third-party advertising cookies. Analytics data is collected anonymously to improve platform performance. You can manage cookie preferences through your browser settings.`,
  },
  {
    icon: Baby,
    title: "Children's Privacy",
    content: `Orion Labs is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately at support@orionlabs.com and we will promptly delete it. School module data (student records) is managed by the school administrator and is subject to the school's own data protection policies.`,
  },
  {
    icon: RefreshCw,
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via email or through an in-app notification. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the platform after changes constitutes acceptance of the updated policy.`,
  },
  {
    icon: Mail,
    title: 'Contact Information',
    content: `If you have any questions about this Privacy Policy or how we handle your data, please contact us at support@orionlabs.com. We aim to respond to all enquiries within 48 hours.`,
  },
];

export default function PrivacyPolicy() {
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
            Privacy <span className="bg-gradient-to-r from-cyan via-accent to-coral bg-clip-text text-transparent">Policy</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
            How Orion Labs collects, uses, and protects your information.
          </p>
          <p className="text-sm text-white/50 mt-4">Last updated: February 2026</p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <div
                key={section.title}
                className="flex gap-5 p-6 rounded-2xl border border-border bg-card animate-slide-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <section.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground mb-2">{section.title}</h2>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
