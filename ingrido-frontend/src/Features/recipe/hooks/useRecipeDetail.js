// recipe/hooks/useRecipeDetail.js
import { useState, useEffect, useRef } from "react";
import { recipeService } from "../services/recipeService";
import { saveToLocalHistory } from "../utils/recipeUtils";
import { BACKEND_URL } from "../../../config/api";

export const useRecipeDetail = (id, titleParam) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const isAI = (id && id.toString().startsWith("ai-")) || titleParam || !Number.isInteger(Number(id));
        
        let data = null;
        let lastError = null;
        
        // Retry logic for AI recipes
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Fetch attempt ${attempt} for: ${isAI ? 'AI' : 'DB'} recipe`);
            data = await recipeService.fetchRecipeDetail(id, isAI, titleParam);
            
            if (data && !data.error) {
              break; // Success, exit retry loop
            }
          } catch (err) {
            lastError = err;
            console.log(`Attempt ${attempt} failed:`, err.message);
            
            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
              const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        if (!data || data.error) {
          throw new Error(lastError?.message || "Failed to fetch recipe");
        }
        
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
          const token = localStorage.getItem("ingrido_token");
          if (token) {
            try {
              await recipeService.saveToBackendHistory(currentRecipe);
            } catch (err) {
              console.error("Save to backend error:", err);
            }
          }
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
  }, [id, titleParam, retryCount]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    recipe,
    loading,
    isAiGenerated,
    error,
    retry,
  };
};