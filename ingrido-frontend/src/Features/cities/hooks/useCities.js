import { useState, useEffect, useCallback } from "react";
import { citiesService } from "../services/citiesServices";

export const useCities = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await citiesService.fetchCities();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setError("Failed to load cities. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCities();
  }, [fetchCities]);

  // Filter cities based on search term
  const filteredCities = cities.filter(
    (city) =>
      city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const clearSearch = () => setSearchTerm("");

  return {
    cities,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredCities,
    clearSearch,
    refetch: fetchCities,
  };
};