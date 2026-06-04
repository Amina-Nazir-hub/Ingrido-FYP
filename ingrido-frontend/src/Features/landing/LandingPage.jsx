import { HeroSection } from "./components/HeroSection";
import { FeaturesSection } from "./components/FeaturesSection";
import { CTASection } from "./components/CTASection";

export const LandingPage = () => {
  return (
    <main className="flex-1 pt-16 md:pt-20">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </main>
  );
};

export default LandingPage;