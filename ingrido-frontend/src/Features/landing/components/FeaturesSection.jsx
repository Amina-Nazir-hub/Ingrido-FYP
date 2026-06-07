import { FeatureCard } from "./FeatureCard";
import { FEATURES } from "../constants";

export const FeaturesSection = () => {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
            How Ingrido Works
          </h2>
          <p className="text-foreground max-w-md mx-auto">
            Smart meal planning made simple — from signup to your dinner table.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
