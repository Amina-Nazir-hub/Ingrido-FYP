import { ArrowRight } from "lucide-react";
import { HeroBadge } from "./HeroBadge";
import { HERO_IMAGE } from "../constants";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Delicious Pakistani cuisine spread"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-r from-foreground/95 via-foreground/80 to-foreground/40" />
      </div>

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <HeroBadge />

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background mb-6 animate-fade-up [animation-delay:0.1s]">
            Simple, Smart, Personalized{" "}
            <span className="text-primary">Meal Planning</span>
          </h1>

          <p className="text-lg md:text-xl text-background/80 mb-8 leading-relaxed animate-fade-up [animation-delay:0.2s]">
            Plan meals that match your taste, preferences, and local seasonal
            ingredients — for fresh, delicious, stress-free dining every day.
          </p>

          <HeroButtons />
        </div>
      </div>

      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-22 bg-linear-to-t from-background/60 to-transparent" />
    </section>
  );
};

const HeroButtons = () => (
  <div className="flex flex-wrap gap-4 mb-12 animate-fade-up [animation-delay:0.3s]">
    <a href="/register">
      <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold shadow-lg hover:bg-primary/75 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 h-14 rounded-xl px-10 text-lg cursor-pointer">
        Get Started
        <ArrowRight className="w-5 h-5" />
      </button>
    </a>

    <a href="/demo">
      <button className="inline-flex items-center justify-center  bg-background text-foreground hover:bg-background/30 hover:text-foreground hover:underline font-semibold transition-all duration-300 h-14 rounded-xl px-10 text-lg cursor-pointer">
        Watch Demo
      </button>
    </a>
  </div>
);
