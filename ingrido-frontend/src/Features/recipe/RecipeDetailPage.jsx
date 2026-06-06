// Features/recipe/RecipeDetailPage.jsx
import React from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import RecipeHeader from "./components/RecipeHeader";
import RecipeMedia from "./components/RecipeMedia";
import RecipeInfo from "./components/RecipeInfo";
import RecipeDescription from "./components/RecipeDescription";
import IngredientsList from "./components/IngredientsList";
import DirectionsList from "./components/DirectionsList";
import AISubstitute from "./components/AISubstitute";
import LoadingState from "./components/LoadingState";
import NotFoundState from "./components/NotFoundState";
import { useRecipeDetail } from "./hooks/useRecipeDetail";
import { useAISubstitute } from "./hooks/useAISubstitute";
import { AlertCircle, RefreshCw } from "lucide-react";

export function RecipeDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const titleParam = searchParams.get("title");

  const { recipe, loading, isAiGenerated, error, retry } = useRecipeDetail(
    id,
    titleParam,
  );
  const {
    ingredientSearch,
    setIngredientSearch,
    subResult,
    isAiLoading,
    handleCheckSubstitute,
  } = useAISubstitute(recipe, isAiGenerated);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Recipe not found
          </h2>
          <p className="text-muted-foreground mb-6">
            {error || "Unable to load recipe. Please try again."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={retry}
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-border rounded-lg font-semibold hover:bg-secondary/20 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayTitle = recipe.title || recipe.meal || "Tasty Recipe";
<<<<<<< HEAD

  // ✅ IMPORTANT FIX: Get the correct ID
  let recipeId = null;
  let isAIRecipe = isAiGenerated;

  // Check if it's AI recipe
=======
  let recipeId = null;
  let isAIRecipe = isAiGenerated;
  
>>>>>>> origin/main
  if (isAiGenerated || (id && id.toString().startsWith("ai-")) || titleParam) {
    isAIRecipe = true;
    recipeId = displayTitle; 
  } else {
  
    recipeId = recipe.id || id;
  }

  console.log("RecipeDetailPage - Passing to Header:", {
    recipeId,
    displayTitle,
    isAIRecipe,
    originalId: id,
    recipeIdFromData: recipe.id,
  });

  return (
    <>
      <RecipeHeader
        title={displayTitle}
<<<<<<< HEAD
        id={recipeId} // ✅ Pass correct ID (not undefined)
=======
        id={recipeId}  
>>>>>>> origin/main
        isAiGenerated={isAIRecipe}
        onBack={() => navigate(-1)}
      />

      <section className="container mx-auto max-w-6xl mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] px-4">
        <RecipeMedia recipe={recipe} displayTitle={displayTitle} />

        <div className="space-y-6">
          <RecipeInfo recipe={recipe} isAiGenerated={isAIRecipe} />
          <RecipeDescription recipe={recipe} displayTitle={displayTitle} />
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-12 px-4">
        <div className="rounded-2xl border-4 border-primary bg-card shadow-md overflow-hidden grid md:grid-cols-2">
          <IngredientsList ingredients={recipe.ingredients} />
          <DirectionsList instructions={recipe.instructions} />
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-12 px-4 mb-20">
        <AISubstitute
          ingredientSearch={ingredientSearch}
          setIngredientSearch={setIngredientSearch}
          subResult={subResult}
          isAiLoading={isAiLoading}
          onCheckSubstitute={handleCheckSubstitute}
          groceryUrl={recipe.grocery_url}
        />
      </section>
    </>
  );
}

export default RecipeDetailPage;
