import { Link } from 'react-router-dom';
import { PlatformLogo } from '@/components/shared/PlatformLogo';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg px-4 py-2 inline-block mb-4">
              <PlatformLogo className="h-8 w-auto" />
            </div>
            <p className="text-primary-foreground/70 max-w-sm">
              The all-in-one business management platform designed for your business. 
              Quotes, invoices, and more.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-display font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Quotes</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Invoices</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Delivery Notes</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">CRM</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Profitability</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Sign In</Link></li>
              <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Sign Up</Link></li>
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
