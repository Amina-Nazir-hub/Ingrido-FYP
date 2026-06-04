import { ArrowLeft, Bookmark } from "lucide-react";

const RecipeHeader = ({ title, isSaved, onSave, onBack }) => {
  return (
    <section className="border-b border-border bg-secondary/40 mt-20 px-4">
      <div className="container py-8 mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-6 rounded-2xl bg-card p-6 shadow-sm md:p-8">
          <div className="flex-1">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-2 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl leading-tight">
              {title}
            </h1>
          </div>

          <button
            onClick={onSave}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              isSaved
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary shadow-sm"
            }`}
            title={isSaved ? "Remove from saved" : "Save Recipe"}
          >
            <Bookmark
              className={`h-6 w-6 transition-all ${isSaved ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecipeHeader;