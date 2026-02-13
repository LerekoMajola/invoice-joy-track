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
              The modular platform for businesses, workshops, schools, law firms, rental companies, and guest houses across Africa.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="font-display font-semibold mb-4">Solutions</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth?system=business" className="hover:text-primary-foreground transition-colors">Business Management</Link></li>
              <li><Link to="/auth?system=workshop" className="hover:text-primary-foreground transition-colors">Workshop & Repairs</Link></li>
              <li><Link to="/auth?system=school" className="hover:text-primary-foreground transition-colors">School Admin</Link></li>
              <li><Link to="/auth?system=legal" className="hover:text-primary-foreground transition-colors">Legal Practice</Link></li>
              <li><Link to="/auth?system=hire" className="hover:text-primary-foreground transition-colors">Tool & Equipment Hire</Link></li>
              <li><Link to="/auth?system=guesthouse" className="hover:text-primary-foreground transition-colors">Guest House</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-display font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Invoicing</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Staff & Payroll</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Accounting</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Task Management</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link></li>
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
