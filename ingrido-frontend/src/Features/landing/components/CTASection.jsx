import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
  <section className="py-20 bg-card border-2 border-primary m-4 rounded-xl">
      <div className="container px-4 text-center ">
        <div className="animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display">
            Ready to Eat Better?
          </h2>
          <p className="text-foreground mb-8 max-w-md mx-auto pt-4">
            Sign up today and get your first personalized weekly meal plan —
            completely free.
          </p>
          <a
            className="inline-flex mt-2 items-center justify-center gap-2 bg-primary text-primary-foreground font-bold hover:bg-primary/75 transition-all duration-300 h-12 rounded-xl px-8 text-lg shadow-lg hover:-translate-y-0.5"
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
