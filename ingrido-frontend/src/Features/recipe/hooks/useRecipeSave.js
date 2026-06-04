import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { recipeService } from "../services/recipeService";
import { STORAGE_KEYS, ROUTES } from "../constants";

export const useRecipeSave = (recipe, id, isAiGenerated) => {
  const [isSaved, setIsSaved] = useState(recipe?.is_saved || false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (!token) {
      const confirmLogin = window.confirm(
        "Please login to save recipes. Would you like to login now?"
      );
      if (confirmLogin) {
        navigate(ROUTES.LOGIN);
      }
      return;
    }

    try {
      setSaving(true);
      const recipeTitle = recipe?.title || recipe?.meal || "";
      
      const res = await recipeService.toggleBookmark(id, recipeTitle, isAiGenerated);
      
      const newSavedStatus = res.saved !== undefined ? res.saved : !isSaved;
      setIsSaved(newSavedStatus);
      
      return newSavedStatus;
    } catch (err) {
      console.error("Save error:", err);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        navigate(ROUTES.LOGIN);
      } else if (err.response?.data?.error) {
        alert(err.response.data.error);
      } else {
        alert("Error saving recipe. Please try again.");
      }
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    isSaved,
    saving,
    handleSave,
  };
};