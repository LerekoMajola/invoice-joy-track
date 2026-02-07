import { Hero } from '@/components/landing/Hero';
import { Solutions } from '@/components/landing/Solutions';
import { Features } from '@/components/landing/Features';
import { PricingTable } from '@/components/landing/PricingTable';
import { Footer } from '@/components/landing/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Solutions />
      <Features />
      <PricingTable />
      <Footer />
    </div>
  );
}
