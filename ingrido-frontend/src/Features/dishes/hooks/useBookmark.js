import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dishesService } from "../services/dishesServices";
import { ROUTES, STORAGE_KEYS } from "../constants";

export const useBookmark = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleBookmark = async (recipeId, updateLocalState) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      navigate(ROUTES.LOGIN || "/login");
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await dishesService.toggleBookmark(recipeId);
      
      // Update local state if callback provided
      if (updateLocalState) {
        updateLocalState(recipeId, response.saved);
      }
      
      return response.saved;
    } catch (err) {
      console.error("Error toggling bookmark:", err);
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