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
import { useRecipeSave } from "./hooks/useRecipeSave";
import { useAISubstitute } from "./hooks/useAISubstitute";

export function RecipeDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const titleParam = searchParams.get("title");
  
  const { recipe, loading, isAiGenerated, error } = useRecipeDetail(id, titleParam);
  const { isSaved, handleSave } = useRecipeSave(recipe, id, isAiGenerated);
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
    return <NotFoundState />;
  }

  const displayTitle = recipe.title || recipe.meal || "Tasty Recipe";

  return (
    <>
      <RecipeHeader
        title={displayTitle}
        isSaved={isSaved}
        onSave={handleSave}
        onBack={() => navigate(-1)}
      />

      <section className="container mx-auto max-w-6xl mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr] px-4">
        <RecipeMedia recipe={recipe} displayTitle={displayTitle} />
        
        <div className="space-y-6">
          <RecipeInfo recipe={recipe} isAiGenerated={isAiGenerated} />
          <RecipeDescription recipe={recipe} displayTitle={displayTitle} />
        </div>
      </section>

      <section className="container mx-auto max-w-6xl mt-12 px-4">
        <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden grid md:grid-cols-2">
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