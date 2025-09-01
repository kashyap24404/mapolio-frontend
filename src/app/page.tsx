import HeroSection from '@/components/site/HeroSection';
import FeaturesSection from '@/components/site/FeaturesSection';
import UseCasesSection from '@/components/site/UseCasesSection';
import PricingSection from '@/components/site/PricingSection';
import FAQSection from '@/components/site/FAQSection';
import CTASection from '@/components/site/CTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <FeaturesSection />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
