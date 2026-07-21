import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { BACKEND_URL } from "../config/api";

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFetching = useRef(false);
  const fetchTimeout = useRef(null);

  const fetchBookmarks = async () => {
    if (isFetching.current) return;

    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      setBookmarkedRecipes([]);
      return;
    }

    isFetching.current = true;

    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/account/saved/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setBookmarkedRecipes(response.data);
    } catch (err) {
      console.error("Fetch bookmarks error:", err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  };

  const isBookmarked = (id, title, isAI = false) => {
    if (!id && !title) return false;

    const isSeasonal = id && id.toString().includes("seasonal");
    const effectiveIsAI = isAI || isSeasonal;

    if (effectiveIsAI) {
      const lowerId = id ? id.toString().toLowerCase() : '';
      const lowerTitle = title ? title.toLowerCase() : '';
      return bookmarkedRecipes.some(
        (recipe) =>
          recipe.is_ai_generated === true &&
          (recipe.title?.toLowerCase() === lowerTitle ||
            recipe.title?.toLowerCase() === lowerId ||
            recipe.recipe_id?.toString().toLowerCase() === lowerId),
      );
    }
    return bookmarkedRecipes.some(
      (recipe) =>
        (Number(recipe.recipe_id) === Number(id) ||
          Number(recipe.id) === Number(id)) &&
        !recipe.is_ai_generated,
    );
  };
  const toggleBookmark = async (id, title, isAI = false, recipeData = {}) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      alert("Please login to save recipes");
      window.location.href = "/login";
      return false;
    }
    if ((!id || id === "undefined") && !title) {
      console.error("No valid id or title provided", { id, title });
      return false;
    }

    let actualIsAI = isAI;
    let actualId = id;
    let actualTitle = title;
    const isSeasonalOrAI =
      (id &&
        typeof id === "string" &&
        (id.includes("seasonal") || id.startsWith("ai-"))) ||
      isAI;

    if (isSeasonalOrAI) {
      const recipeTitle = title || recipeData?.title;
      if (!recipeTitle) {
        console.error("No title for AI/Seasonal recipe", { id, title });
        return false;
      }
      actualIsAI = true;
      actualId = recipeTitle;
      actualTitle = recipeTitle;
      console.log("🔄 AI/Seasonal recipe detected! Using title:", recipeTitle);
    }
    if (
      actualId === "undefined" ||
      actualId === null ||
      actualId === undefined
    ) {
      if (actualTitle) {
        actualId = actualTitle;
        actualIsAI = true;
      } else {
        console.error("Invalid ID after processing", { actualId, actualTitle });
        return false;
      }
    }

    try {
      let endpoint;

      if (actualIsAI) {
        const recipeTitle = actualTitle || recipeData?.title || title;
        if (!recipeTitle) {
          console.error("No title for AI recipe");
          return false;
        }
        endpoint = `${BACKEND_URL}/api/account/recipes/ai/${encodeURIComponent(recipeTitle)}/bookmark/`;
        console.log("✅ AI Endpoint:", endpoint);
      } else {
        const numericId = Number(actualId);
        if (isNaN(numericId)) {
          console.error("Invalid numeric ID for regular recipe", actualId);
          return false;
        }
        endpoint = `${BACKEND_URL}/api/account/recipes/${numericId}/bookmark/`;
        console.log("✅ Regular Endpoint:", endpoint);
      }

      const response = await axios.post(
        endpoint,
        {},
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      const isSaved =
        response.data.saved === true || response.data.status === "saved";

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
    <BookmarkContext.Provider
      value={{
        bookmarkedRecipes,
        isBookmarked,
        toggleBookmark,
        refreshBookmarks: fetchBookmarks,
        clearBookmarks,
        loading,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmark = () => useContext(BookmarkContext);
