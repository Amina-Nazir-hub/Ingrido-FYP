import { useState } from "react";
import { ArrowLeft, Bookmark } from "lucide-react";
import { useBookmark } from "../../../context/BookmarkContext";

const RecipeHeader = ({ title, id, isAiGenerated, onBack }) => {
  const { isBookmarked, toggleBookmark } = useBookmark();
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Debug log to see what's coming in
  console.log("RecipeHeader received:", { title, id, isAiGenerated });
  const validId = id || (isAiGenerated ? title : null);

  if (!validId && !isAiGenerated) {
    console.error("RecipeHeader: No valid id provided!");
  }

  const isSaved = isBookmarked(validId, title, isAiGenerated);

  const handleSave = async () => {
    if (!validId && !isAiGenerated) {
      console.error("Cannot save: No valid identifier");
      alert("Cannot save this recipe. Missing information.");
      return;
    }

    setIsLoading(true);
    const result = await toggleBookmark(validId, title, isAiGenerated);
    console.log("Save completed, new status:", result);
    setIsLoading(false);
  };

  return (
    <section className="border-b border-border bg-background mt-20 px-4">
      <div className="container py-8 mx-auto max-w-6xl ">
        <div className="flex items-center justify-between gap-6 rounded-2xl bg-card p-6 shadow-sm md:p-8 border">
          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl leading-tight">
              {title}
            </h1>
          </div>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              isSaved
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-primary border-border text-primary-foreground "
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
