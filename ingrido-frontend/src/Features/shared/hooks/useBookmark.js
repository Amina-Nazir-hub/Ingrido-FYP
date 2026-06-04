// src/hooks/useBookmarkStatus.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_BASE = "http://127.0.0.1:8000";

export const useBookmarkStatus = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all bookmarked recipe IDs
  const fetchBookmarks = useCallback(async () => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) return [];

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_BASE}/api/account/saved/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      const savedIds = response.data.map(item => item.recipe_id || item.id);
      setBookmarkedIds(savedIds);
      return savedIds;
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Check if a specific recipe is bookmarked
  const isBookmarked = useCallback((recipeId) => {
    return bookmarkedIds.includes(recipeId);
  }, [bookmarkedIds]);

  // Add bookmark to local state
  const addBookmark = useCallback((recipeId) => {
    setBookmarkedIds(prev => {
      if (!prev.includes(recipeId)) {
        return [...prev, recipeId];
      }
      return prev;
    });
  }, []);

  // Remove bookmark from local state
  const removeBookmark = useCallback((recipeId) => {
    setBookmarkedIds(prev => prev.filter(id => id !== recipeId));
  }, []);

  // Toggle bookmark (call API then update local state)
  const toggleBookmark = useCallback(async (recipeId, recipeTitle, isAiGenerated) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      return { success: false, isSaved: false };
    }

    try {
      let endpoint;
      if (isAiGenerated) {
        endpoint = `${BACKEND_BASE}/api/account/recipes/ai/${encodeURIComponent(recipeTitle)}/bookmark/`;
      } else {
        endpoint = `${BACKEND_BASE}/api/account/recipes/${recipeId}/bookmark/`;
      }

      const response = await axios.post(endpoint, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      const isSaved = response.data.saved === true || response.data.status === "saved";
      
      if (isSaved) {
        addBookmark(recipeId);
      } else {
        removeBookmark(recipeId);
      }
      
      return { success: true, isSaved };
    } catch (err) {
      console.error("Bookmark error:", err);
      return { success: false, isSaved: false };
    }
  }, [addBookmark, removeBookmark]);

  // Load bookmarks on mount
  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  return {
    bookmarkedIds,
    loading,
    fetchBookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
  };
};