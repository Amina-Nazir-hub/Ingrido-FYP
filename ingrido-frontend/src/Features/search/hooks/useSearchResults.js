import { useState, useEffect, useRef } from "react";
import { searchService } from "../services/searchService";
import { DEFAULT_SUGGESTIONS } from "../constants";

export const useSearchResults = (query) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      setSearchError(null);
      
      try {
        const data = await searchService.searchRecipes(query);
        
        // Check for invalid search
        if (data && data.is_invalid) {
          setResults([]);
          setSearchError(data.error);
          setSuggestions(data.suggestions || DEFAULT_SUGGESTIONS);
          setLoading(false);
          return;
        }
        
        // Set results
        if (Array.isArray(data)) {
          setResults(data);
        } else {
          setResults([]);
        }
        
        // Save to search history
        const historyData = await searchService.addToSearchHistory(query);
        if (!historyData) {
          searchService.saveToLocalHistory(query);
        }
        
      } catch (err) {
        console.error("AI Search logic error:", err);
        if (err.response?.data?.is_invalid) {
          setSearchError(err.response.data.error);
          setSuggestions(err.response.data.suggestions || DEFAULT_SUGGESTIONS);
          setResults([]);
        } else {
          setResults([]);
          setSearchError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchResults();
    }
  }, [query]);

  const updateRecipeBookmark = (recipeId, recipeTitle, isSaved) => {
    setResults((prevResults) =>
      prevResults.map((recipe) => {
        const matchCondition = 
          recipe.id === recipeId || 
          recipe.title === recipeTitle || 
          recipe.meal === recipeTitle;
        return matchCondition ? { ...recipe, is_saved: isSaved } : recipe;
      })
    );
  };

  return {
    results,
    loading,
    searchError,
    suggestions,
    updateRecipeBookmark,
  };
};