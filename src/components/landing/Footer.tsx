import { Link } from 'react-router-dom';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <PlatformLogo className="h-20 w-auto rounded-2xl p-5 bg-white shadow-sm mb-4" />
            <p className="text-primary-foreground/70 text-sm">
              The modular platform for businesses, workshops, and schools across Africa.
            </p>
          </div>

          {/* Business */}
          <div>
            <h4 className="font-display font-semibold mb-4">Business Management</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Quotes & Invoices</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Client CRM</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Delivery Notes</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Profitability</Link></li>
            </ul>
          </div>

          {/* Workshop & School */}
          <div>
            <h4 className="font-display font-semibold mb-4">Workshop & School</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Job Cards</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Parts & Labour</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Student Records</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">School Fees</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Sign In</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Start Free Trial</Link></li>
              <li><a href="mailto:support@orionlabs.com" className="hover:text-primary-foreground transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Orion Labs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
