import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { savedService } from "../services/savedService";
import { STORAGE_KEYS, ROUTES, BACKEND_URL } from "../constants";
import axios from "axios";

export const useSavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBookmarks = useCallback(async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await savedService.fetchSavedRecipes();
      
      // ✅ Process saved recipes to ensure images are handled properly
      const processedData = data.map(recipe => ({
        ...recipe,
        // Ensure image URL is properly formatted
        image: recipe.image || recipe.recipe_details?.image || null,
        // Add default values for missing fields
        kcal: recipe.kcal || recipe.calories || recipe.recipe_details?.kcal || "350",
        prep_time: recipe.prep_time || recipe.recipe_details?.prep_time || "25",
        protein: recipe.protein || recipe.recipe_details?.protein || "20g",
        dietary_type: recipe.dietary_type || recipe.recipe_details?.dietary_type || "mixed"
      }));
      
      setSavedRecipes(processedData);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      setError("Failed to load saved recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUnsave = async (identifier, isAiGenerated = false) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      navigate(ROUTES.LOGIN);
      return false;
    }

    try {
      setRemovingId(identifier);
      
      let endpoint;
      if (isAiGenerated) {
        endpoint = `${BACKEND_URL}/api/account/recipes/ai/${encodeURIComponent(identifier)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_URL}/api/account/recipes/${identifier}/bookmark/`;
      }
      
      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Token ${token}` }
      });

      if (response.data?.status === "removed" || response.data?.saved === false) {
        setSavedRecipes((prev) =>
          prev.filter((r) => {
            const id = r.recipe_id || r.id;
            if (isAiGenerated) {
              return r.title !== identifier;
            }
            return id !== identifier;
          })
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Could not remove bookmark:", error);
      setError("Could not remove bookmark. Please try again.");
      return false;
    } finally {
      setRemovingId(null);
    }
  };

  const clearError = () => setError(null);

  // ✅ Function to refresh a single recipe's bookmark status
  const refreshRecipeStatus = useCallback(async (recipeId) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;

    try {
      const response = await axios.get(`${BACKEND_URL}/api/account/saved/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      const savedIds = response.data.map(item => item.recipe_id || item.id);
      
      setSavedRecipes(prev =>
        prev.map(recipe => ({
          ...recipe,
          is_saved: savedIds.includes(recipe.recipe_id || recipe.id)
        }))
      );
    } catch (error) {
      console.error("Error refreshing bookmark status:", error);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    savedRecipes,
    loading,
    removingId,
    error,
    handleUnsave,
    fetchBookmarks,
    clearError,
    refreshRecipeStatus,
  };
};