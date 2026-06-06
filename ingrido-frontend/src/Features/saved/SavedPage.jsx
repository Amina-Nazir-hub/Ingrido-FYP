import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import SavedHeader from "./components/SavedHeader";
import SavedStats from "./components/SavedStats";
import SavedRecipeCard from "./components/SavedRecipeCard";
import LoadingState from "./components/LoadingState";
import EmptySavedState from "./components/EmptySavedState";
import { useBookmark } from "../../context/BookmarkContext";

// API config
const BACKEND_BASE = "http://127.0.0.1:8000";
const SAVED_RECIPES_URL = `${BACKEND_BASE}/api/account/saved/`;

const getAuthConfig = () => {
  const token = localStorage.getItem("ingrido_token");
  return {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  };
};

const SavedPage = () => {
  const navigate = useNavigate();
  const { toggleBookmark } = useBookmark();

  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState(new Set());

  const fetchSavedRecipes = useCallback(async () => {
    const token = localStorage.getItem("ingrido_token");

    if (!token) {
      setSavedRecipes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(SAVED_RECIPES_URL, getAuthConfig());

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || response.data.bookmarks || [];

      setSavedRecipes(data);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedRecipes();
  }, [fetchSavedRecipes]);

  const handleUnsave = useCallback(
    async (identifier, isAiGenerated) => {
      // instant UI update
      setSavedRecipes((prev) =>
        prev.filter((recipe) => {
          const recipeId = recipe.recipe_id || recipe.id;
          const recipeTitle = recipe.title || recipe.recipe_details?.title;

          if (isAiGenerated) {
            return recipeTitle !== identifier;
          } else {
            return recipeId !== identifier;
          }
        })
      );

      setRemovingIds((prev) => new Set([...prev, identifier]));

      try {
        await toggleBookmark(identifier, identifier, isAiGenerated);
        await fetchSavedRecipes();
      } catch (error) {
        console.error("Unsave error:", error);
        await fetchSavedRecipes();
      } finally {
        setRemovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(identifier);
          return newSet;
        });
      }
    },
    [toggleBookmark, fetchSavedRecipes]
  );

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SavedHeader />

      <main className="mx-auto max-w-7xl px-6 py-10 font-sans">
        <SavedStats count={savedRecipes.length} />

        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {savedRecipes.map((recipe) => (
              <SavedRecipeCard
                key={recipe.id || recipe.bookmark_id || recipe.recipe_id || recipe.title}
                recipe={recipe}
                onUnsave={handleUnsave}
                isRemoving={removingIds.has(
                  recipe.recipe_id || recipe.id || recipe.title
                )}
              />
            ))}
          </div>
        ) : (
          <EmptySavedState />
        )}
      </main>
    </div>
  );
};

export default SavedPage;