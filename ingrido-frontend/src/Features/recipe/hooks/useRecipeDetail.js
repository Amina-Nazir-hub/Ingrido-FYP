import { useState, useEffect } from "react";
import { recipeService } from "../services/recipeService";
import { saveToLocalHistory } from "../utils/recipeUtils";
import { BACKEND_URL } from "../constants";

export const useRecipeDetail = (id, titleParam) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const isAI = (id && id.toString().startsWith("ai-")) || titleParam || !Number.isInteger(Number(id));
        
        const data = await recipeService.fetchRecipeDetail(id, isAI, titleParam);
        
        if (data) {
          setRecipe(data);
          setIsAiGenerated(data.is_ai_generated || isAI);
          
          const currentRecipe = {
            id: data.id || id,
            title: data.title || data.meal,
            meal: data.title || data.meal,
            kcal: data.kcal,
            prep_time: data.prep_time,
            image: data.image || null,
            is_ai_generated: data.is_ai_generated || isAI || false
          };

          // Save to localStorage history
          saveToLocalHistory(currentRecipe);
          
          // Save to backend history
          await recipeService.saveToBackendHistory(currentRecipe);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        if (err.response?.status === 404) {
          setError("Recipe not found");
          setRecipe(null);
        } else {
          setError("Failed to load recipe. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetail();
  }, [id, titleParam]);

  return {
    recipe,
    loading,
    isAiGenerated,
    error,
  };
};