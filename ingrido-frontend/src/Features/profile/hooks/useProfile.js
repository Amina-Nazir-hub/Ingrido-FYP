import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileService from "../services/profileService";
import { ROUTES, HEALTH_OPTIONS, DIET_OPTIONS } from "../constants";

export const useProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    first_name: "",
    email: "",
    health_conditions: [],
    dietary_preferences: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("ingrido_token");

  const formatOptions = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map(item => {
      const option = [...HEALTH_OPTIONS, ...DIET_OPTIONS].find(opt => opt.value === item);
      return option || { value: item, label: item };
    });
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await ProfileService.fetchProfile();
        
        const healthOptions = formatOptions(data.health_conditions);
        const dietOptions = formatOptions(data.dietary_preferences);
        
        setProfile({
          ...data,
          health_conditions: healthOptions,
          dietary_preferences: dietOptions,
        });
        
        if (data.first_name) {
          ProfileService.updateLocalStorage(data.first_name);
        }
        setError(null);
      } catch (err) {
        console.error("Profile load error", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const updateProfileField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    if (!token) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      setSaving(true);
      await ProfileService.updateProfile(profile);
      ProfileService.updateLocalStorage(profile.first_name);
      setError(null);
      return true;
    } catch (err) {
      console.error("Update failed:", err);
      setError("Update failed! Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const goToDashboard = () => {
    navigate(ROUTES.DASHBOARD);
  };

  const getUserInitial = () => {
    const name = profile.first_name || "User";
    return name.charAt(0).toUpperCase();
  };

  return {
    profile,
    loading,
    error,
    saving,
    token,
    updateProfileField,
    saveProfile,
    goToDashboard,
    getUserInitial
  };
};