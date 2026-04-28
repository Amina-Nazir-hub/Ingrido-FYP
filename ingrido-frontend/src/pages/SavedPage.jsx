import React from "react";
import { Bookmark, Eye } from "lucide-react";

// --- DATA ---
// Update the 'img' paths here to match your actual file names in the assets folder
const recipes = [
  {
    id: 1,
    title: "Mediterranean Quinoa Salad",
    img: "/assets/Quinoa-Salad.jpeg", // Updated to point to your quinoa image
    kcal: 320,
    time: "15 mins",
    protein: "20g",
    date: "April 20, 2026",
  },
  {
    id: 2,
    title: "Grilled Salmon & Asparagus",
    img: "/assets/salmon.jpeg", // Updated to point to your salmon image
    kcal: 550,
    time: "25 mins",
    protein: "35g",
    date: "April 22, 2026",
  },
];

// --- SUB-COMPONENTS ---

const SavedRecipesHeader = () => {
  return (
    <section className="mt-20 border-b border-border bg-secondary/10 animate-fade-in">
      <div className="mx-auto px-6 py-14 text-center">
        {/* h1 uses Playfair Display from your @layer base */}
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
          Your Saved Recipes Collection
        </h1>
        <p className="mt-3 text-base text-muted-foreground md:text-lg font-sans">
          Quick access to your curated culinary library.
        </p>
      </div>
    </section>
  );
};

const SavedRecipesGrid = () => {
  return (
    <main className="mx-auto space-y-12 px-6 py-10 font-sans">
      <section className="space-y-6">
        <header className="rounded-xl border border-border bg-muted/50 px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Saved Recipes</h2>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Saved:</span>{" "}
            {recipes.length} Recipes
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {recipes.map((recipe, index) => (
            <article
              key={recipe.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* IMAGE SECTION */}
              <div className="relative w-full overflow-hidden bg-muted">
                <img
                  src={recipe.img} // Now dynamically pulls quinoa.jpeg or salmon.jpeg
                  alt={recipe.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* CONTENT SECTION */}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                  {recipe.title}
                </h3>

                <p className="text-sm font-medium text-muted-foreground">
                  {recipe.kcal} kcal{" "}
                  <span className="mx-1.5 text-border">|</span>
                  {recipe.time} <span className="mx-1.5 text-border">|</span>
                  {recipe.protein} Protein
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground/80">
                    Saved on {recipe.date}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      aria-label={`Unsave ${recipe.title}`}
                      className="rounded-md p-1.5 text-primary transition-colors hover:bg-secondary/10"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                    </button>
                    <button
                      aria-label={`View ${recipe.title}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary/10 hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function SavedPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SavedRecipesHeader />
      <SavedRecipesGrid />
    </div>
  );
}
