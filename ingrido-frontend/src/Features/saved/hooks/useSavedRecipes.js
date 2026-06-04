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
      setSavedRecipes(data);
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
  };
};