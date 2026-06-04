import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 text-center">
        <div className="animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4 font-display">
            Ready to Eat Better?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
            Sign up today and get your first personalized weekly meal plan — completely free.
          </p>
          <a
            className="inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-bold hover:bg-secondary/90 transition-all duration-300 h-12 rounded-xl px-8 text-lg shadow-lg hover:-translate-y-0.5"
            href="/register"
          >
            Create Your Profile
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};