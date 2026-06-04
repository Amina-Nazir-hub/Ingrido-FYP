import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS, STORAGE_KEYS } from "../constants";

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSearchHistory = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
      try {
        // Updated endpoint: /api/accounts/search-history/
        const res = await axios.get(API_ENDPOINTS.SEARCH_HISTORY, {
          headers: { Authorization: `Token ${token}` }
        });
        setSearchHistory(res.data.searches || []);
      } catch (err) {
        console.error("Load search history error:", err);
        const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES) || "[]");
        setSearchHistory(history);
      }
    } else {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES) || "[]");
      setSearchHistory(history);
    }
    setLoading(false);
  };

  const addSearch = async (query) => {
    const cleanQ = query.trim();
    if (!cleanQ) return;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
      try {
        // Updated endpoint: /api/accounts/search-history/add/
        await axios.post(API_ENDPOINTS.SEARCH_HISTORY_ADD, 
          { query: cleanQ },
          { headers: { Authorization: `Token ${token}` } }
        );
        await loadSearchHistory();
      } catch (err) {
        console.error("Save search error:", err);
        updateLocalHistory(cleanQ);
      }
    } else {
      updateLocalHistory(cleanQ);
    }
  };

  const removeSearch = async (queryToRemove) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (token) {
      try {
        // Updated endpoint: /api/accounts/search-history/remove/{query}/
        await axios.delete(API_ENDPOINTS.SEARCH_HISTORY_REMOVE(queryToRemove), {
          headers: { Authorization: `Token ${token}` }
        });
        await loadSearchHistory();
      } catch (err) {
        console.error("Remove search error:", err);
        removeLocalHistory(queryToRemove);
      }
    } else {
      removeLocalHistory(queryToRemove);
    }
  };

  const updateLocalHistory = (query) => {
    let currentHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES) || "[]");
    currentHistory = currentHistory.filter(item => item.toLowerCase() !== query.toLowerCase());
    currentHistory.unshift(query);
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(currentHistory.slice(0, 6)));
    setSearchHistory(currentHistory.slice(0, 6));
  };

  const removeLocalHistory = (queryToRemove) => {
    const updated = searchHistory.filter(h => h !== queryToRemove);
    setSearchHistory(updated);
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
  };

  useEffect(() => {
    loadSearchHistory();
  }, []);

  return {
    searchHistory,
    loading,
    addSearch,
    removeSearch,
    refreshHistory: loadSearchHistory,
  };
};