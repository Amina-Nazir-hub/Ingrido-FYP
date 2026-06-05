// context/BookmarkContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND_BASE = "http://127.0.0.1:8000";

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);
  const fetchTimeout = useRef(null);

  // Fetch all bookmarks from backend
  const fetchBookmarks = async () => {
    if (isFetching.current) {
      return;
    }

    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      setBookmarkedRecipes([]);
      return;
    }

    isFetching.current = true;

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_BASE}/api/account/saved/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setBookmarkedRecipes(response.data);
    } catch (err) {
      console.error("Fetch bookmarks error:", err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  // Check if recipe is bookmarked
  const isBookmarked = (id, title, isAI = false) => {
    if (!id && !title) return false;

    if (isAI) {
      return bookmarkedRecipes.some(recipe =>
        recipe.is_ai_generated === true &&
        (recipe.title === title || recipe.title === id || recipe.recipe_id === id)
      );
    }
    return bookmarkedRecipes.some(recipe =>
      (Number(recipe.recipe_id) === Number(id) || Number(recipe.id) === Number(id)) &&
      !recipe.is_ai_generated
    );
  };

  // Toggle bookmark
  const toggleBookmark = async (id, title, isAI = false, recipeData = {}) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      alert("Please login to save recipes");
      window.location.href = "/login";
      return false;
    }

    if (!id && !title) {
      console.error("No id or title provided for bookmark");
      return false;
    }

    try {
      let endpoint;

      if (isAI) {
        const recipeTitle = title || recipeData?.title;
        if (!recipeTitle) {
          console.error("No title for AI recipe");
          return false;
        }
        endpoint = `${BACKEND_BASE}/api/account/recipes/ai/${encodeURIComponent(recipeTitle)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_BASE}/api/account/recipes/${id}/bookmark/`;
      }

      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Token ${token}` }
      });

      const isSaved = response.data.saved === true || response.data.status === "saved";

      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
      fetchTimeout.current = setTimeout(() => {
        fetchBookmarks();
      }, 300);

      return isSaved;
    } catch (err) {
      console.error("Toggle bookmark error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("ingrido_token");
        window.location.href = "/login";
      }
      return false;
    }
  };

  const clearBookmarks = () => {
    setBookmarkedRecipes([]);
  };

  useEffect(() => {
    fetchBookmarks();
    return () => {
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, []);

  return (
    <BookmarkContext.Provider value={{
      bookmarkedRecipes,
      isBookmarked,
      toggleBookmark,
      refreshBookmarks: fetchBookmarks,
      clearBookmarks,
      loading
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmark = () => useContext(BookmarkContext);