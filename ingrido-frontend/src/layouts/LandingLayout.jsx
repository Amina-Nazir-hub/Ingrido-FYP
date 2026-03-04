import { FeatureCard } from "../components/FeatureCard";
import { Utensils, Leaf, MapPin, CalendarDays, ArrowRight } from "lucide-react";

export function MainLayout() {
  return (
    <main className="flex-1 pt-16 md:pt-20">
      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero-food.jpg"
            alt="Delicious Pakistani cuisine spread"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/40" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm text-primary-foreground px-4 py-2 rounded-full mb-6 animate-fade-up">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium">Eat smarter, live better.</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 animate-fade-up [animation-delay:0.1s]">
              Simple, Smart, Personalized <span className="text-primary">Meal Planning</span>
            </h1>

            <p className="text-lg md:text-xl text-background/80 mb-8 leading-relaxed animate-fade-up [animation-delay:0.2s]">
              Plan meals that match your taste, preferences, and local seasonal
              ingredients — for fresh, delicious, stress-free dining every day.
            </p>

            <div className="flex flex-wrap gap-4 mb-12 animate-fade-up [animation-delay:0.3s]">
              <a href="/register">
                <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold shadow-lg hover:bg-secondary hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-14 rounded-xl px-10 text-lg">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>

              <a href="/demo">
                <button className="inline-flex items-center justify-center border-2 border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground font-semibold transition-all duration-300 h-14 rounded-xl px-10 text-lg">
                  Watch Demo
                </button>
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-22 bg-gradient-to-t from-background/60 to-transparent" />
      </section>

      {/* --- FEATURES / HOW IT WORKS SECTION --- */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-display">
              How Ingrido Works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Smart meal planning made simple — from signup to your dinner table.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Utensils className="h-6 w-6 text-primary" />}
              title="Personalized Meals"
              description="Get meal recommendations tailored to your dietary preferences, health conditions, and family size."
            />
            <FeatureCard
              icon={<Leaf className="h-6 w-6 text-primary" />}
              title="Seasonal Recipes"
              description="Automatically detects the current season and suggests meals perfect for the weather."
            />
            <FeatureCard
              icon={<MapPin className="h-6 w-6 text-primary" />}
              title="Location-Based Dishes"
              description="Discover local specialties and regional dishes based on your location."
            />
            <FeatureCard
              icon={<CalendarDays className="h-6 w-6 text-primary" />}
              title="Weekly Meal Plans"
              description="Automated 7-day personalized meal schedules with recipes and video tutorials."
            />
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION SECTION --- */}
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
    </main>
  );
}