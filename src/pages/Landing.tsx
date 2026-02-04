import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { PricingTable } from '@/components/landing/PricingTable';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <PricingTable />
      <Footer />
    </div>
  );
}
