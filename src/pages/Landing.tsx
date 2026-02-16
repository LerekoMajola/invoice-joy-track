import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { Solutions } from '@/components/landing/Solutions';
import { Features } from '@/components/landing/Features';
import { PricingTable } from '@/components/landing/PricingTable';
import { Testimonials } from '@/components/landing/Testimonials';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen">
      <Hero />
      <Solutions />
      <Features />
      <Testimonials />
      <PricingTable />
      <Footer />
    </div>
  );
}
