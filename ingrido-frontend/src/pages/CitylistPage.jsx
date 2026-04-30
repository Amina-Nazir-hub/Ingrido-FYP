import React from "react";
import {
  ArrowLeft,
  Flame,
  Clock,
  Drumstick,
  Bookmark,
  Eye,
} from "lucide-react";

const RecipeCard = ({ title, image, kcal, time, protein }) => (
  <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <div className="aspect-video w-full overflow-hidden bg-muted">
      <img
        src={image}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </div>
    <div className="space-y-3 p-5">
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col items-center rounded-md bg-secondary p-2">
          <Flame className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{kcal}</span>
          <span className="text-muted-foreground">kcal</span>
        </div>
        <div className="flex flex-col items-center rounded-md bg-secondary p-2">
          <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{time}</span>
          <span className="text-muted-foreground">mins</span>
        </div>
        <div className="flex flex-col items-center rounded-md bg-secondary p-2">
          <Drumstick className="mb-1 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{protein}</span>
          <span className="text-muted-foreground">protein</span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          aria-label={`Save ${title}`}
        >
          <Bookmark className="h-4 w-4" />
        </button>
        <button
          className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
          aria-label={`View ${title}`}
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    </div>
  </article>
);

const KarachiRecipes = () => {
  const recipes = [
    {
      title: "Sindhi Biryani",
      image:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=70",
      kcal: 250,
      time: 20,
      protein: "12g",
    },
    {
      title: "Bun Kebab",
      image:
        "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=70",
      kcal: 323,
      time: 31,
      protein: "19g",
    },
    {
      title: "Nihari",
      image:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=70",
      kcal: 396,
      time: 42,
      protein: "26g",
    },
    {
      title: "Haleem",
      image:
        "https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=70",
      kcal: 469,
      time: 53,
      protein: "33g",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        <a
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          href="/"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Cities
        </a>

        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Sindh
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Famous Recipes of Karachi
          </h1>
          <p className="mt-2 text-muted-foreground">
            The bustling coastal metropolis known for its vibrant street food
            scene.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe, index) => (
            <RecipeCard key={index} {...recipe} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default KarachiRecipes;
