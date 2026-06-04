import { useState, useEffect, useCallback } from "react";
import { dishesService } from "../services/dishesServices";

export const useDishes = (cityName) => {
  const [recipes, setRecipes] = useState([]);
  const [cityInfo, setCityInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!cityName) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await dishesService.fetchCityRecipes(cityName);
      
      setRecipes(response.recipes || []);
      setCityInfo(response.city || null);
    } catch (error) {
      console.error("Error fetching dishes:", error);
      setError("Failed to load recipes. Please try again.");
      setRecipes([]);
      setCityInfo(null);
    } finally {
      setLoading(false);
    }
  }, [cityName]);

  const updateRecipeBookmark = (recipeId, isSaved) => {
    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) =>
        recipe.id === recipeId ? { ...recipe, is_saved: isSaved } : recipe
      )
    );
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    recipes,
    cityInfo,
    loading,
    error,
    updateRecipeBookmark,
    refetch: fetchData,
  };
};