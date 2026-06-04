import { useState } from "react";
import { recipeService } from "../services/recipeService";

export const useAISubstitute = (recipe, isAiGenerated) => {
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [subResult, setSubResult] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckSubstitute = async () => {
    const ingredient = ingredientSearch.trim();
    if (!ingredient || !recipe) return;
    
    setIsAiLoading(true);
    setSubResult("");
    setError(null);

    try {
      const recipeTitle = recipe?.title || recipe?.meal || "";
      const recipeId = recipe?.id;
      
      const data = await recipeService.getAISubstitute(ingredient, recipeTitle, recipeId, isAiGenerated);
      setSubResult(data.substitute || data.message || "No substitute found.");
    } catch (error) {
      console.error("AI substitute error:", error);
      setError("⚠️ AI service is temporarily unavailable. Please try again later.");
      setSubResult("");
    } finally {
      setIsAiLoading(false);
      setIngredientSearch("");
    }
  };

  return {
    ingredientSearch,
    setIngredientSearch,
    subResult,
    isAiLoading,
    error,
    handleCheckSubstitute,
  };
};