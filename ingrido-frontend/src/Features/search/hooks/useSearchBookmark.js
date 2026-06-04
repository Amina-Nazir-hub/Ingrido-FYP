import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchService } from "../services/searchService";
import { STORAGE_KEYS, ROUTES } from "../constants";

export const useSearchBookmark = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleBookmark = async (recipeId, recipeTitle, isAiRecipe, onSuccess) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      navigate(ROUTES.LOGIN);
      return false;
    }

    try {
      setLoading(true);
      const response = await searchService.toggleBookmark(recipeId, recipeTitle, isAiRecipe);
      const isSaved = response.saved === undefined ? true : response.saved;
      
      if (onSuccess) {
        onSuccess(recipeId, recipeTitle, isSaved);
      }
      
      return isSaved;
    } catch (err) {
      console.error("Error updating bookmark:", err);
      setError("Failed to save/unsave recipe");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleBookmark,
    loading,
    error,
  };
};