import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

export const useBookmark = ({ id, title, isAI, initialIsSaved = false }) => {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleBookmark = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      navigate("/login");
      return false;
    }

    setLoading(true);
    try {
      let endpoint;
      if (isAI) {
        endpoint = API_ENDPOINTS.BOOKMARK_AI_RECIPE(title);
      } else {
        endpoint = API_ENDPOINTS.BOOKMARK_RECIPE(id);
      }

      await axios.post(endpoint, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      setIsSaved(!isSaved);
      return true;
    } catch (err) {
      console.error("Bookmark error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isSaved, loading, toggleBookmark };
};