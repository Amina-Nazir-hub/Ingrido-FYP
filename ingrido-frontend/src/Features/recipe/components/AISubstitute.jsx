import { Sparkles, ShoppingCart } from "lucide-react";
import { DEFAULT_GROCERY_URL } from "../constants";

const AISubstitute = ({
  ingredientSearch,
  setIngredientSearch,
  subResult,
  isAiLoading,
  onCheckSubstitute,
  groceryUrl,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onCheckSubstitute();
    }
  };

  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card p-6 md:p-10">
      <h2 className="text-2xl font-bold font-serif flex items-center gap-2 mb-6 text-foreground">
        <Sparkles className="text-primary" /> Missing an Ingredient?
      </h2>
      <div className="flex flex-col gap-4 md:flex-row">
        {/* bg-primary-foreground to bg-muted/50 change text-foreground for dark mode balance */}
        <input
          type="text"
          placeholder="Ask Chef AI..."
          value={ingredientSearch}
          onChange={(e) => setIngredientSearch(e.target.value)}
          className="grow rounded-xl border border-border bg-muted/50 px-5 py-4 outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground/60 font-medium cursor-pointer"
          onKeyPress={handleKeyPress}
        />
        <button
          onClick={onCheckSubstitute}
          disabled={isAiLoading}
          className="bg-primary text-white px-8 py-4 rounded-xl font-bold transition hover:bg-primary/90 disabled:opacity-70 cursor-pointer"
        >
          {isAiLoading ? "Thinking..." : "Ask Chef AI"}
        </button>
        <button
          onClick={() =>
            window.open(groceryUrl || DEFAULT_GROCERY_URL, "_blank")
          }
          className="bg-[#D70F64] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#D70F64]/90 transition cursor-pointer"
        >
          <ShoppingCart size={20} /> Order on PandaMart
        </button>
      </div>

      {subResult && (
        // Changed bg-white to semantic bg-muted/30 to sync with both light and dark backgrounds smoothly
        <div className="mt-6 p-5 bg-muted/30 rounded-xl border-l-4 border-primary shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles size={12} /> AI Suggestions
          </h4>
          <p className="text-foreground whitespace-pre-wrap font-semibold text-sm leading-relaxed">
            {subResult}
          </p>
        </div>
      )}
    </div>
  );
};

export default AISubstitute;
