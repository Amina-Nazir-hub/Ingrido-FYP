import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { profileService } from "../services/profileService";
import { STORAGE_KEYS, ROUTES } from "../constants";

export const useProfile = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState({
    first_name: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await profileService.fetchProfile();
        setProfile({
          first_name: data.first_name || "",
          email: data.email || "",
        });
        if (data.first_name) {
          localStorage.setItem(STORAGE_KEYS.USER_NAME, data.first_name);
          window.dispatchEvent(new Event("storage_updated"));
        }
      } catch (err) {
        console.error("Profile load error:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const dataToSend = {
        first_name: profile.first_name,
        health_conditions: [],
        dietary_preferences: [],
      };

      await profileService.updateProfile(dataToSend);
      localStorage.setItem(STORAGE_KEYS.USER_NAME, profile.first_name);
      window.dispatchEvent(new Event("storage_updated"));
      
      return true;
    } catch (err) {
      console.error("Save error:", err);
      setError("Update failed! Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await profileService.deleteAccount();
      logout();
      localStorage.clear();
      window.dispatchEvent(new Event("storage_updated"));
      window.location.href = ROUTES.HOME;
      return true;
    } catch (err) {
      console.error("Account deletion failed:", err);
      setError("Failed to delete account. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      return false;
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.dispatchEvent(new Event("storage_updated"));
    navigate(ROUTES.HOME);
  };

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const nameForInitial = profile.first_name || "User";
  const cardInitial = nameForInitial.charAt(0).toUpperCase();

  return {
    profile,
    loading,
    saving,
    isDeleting,
    showDeleteConfirm,
    error,
    cardInitial,
    updateField,
    handleSave,
    handleDeleteAccount,
    handleLogout,
    setShowDeleteConfirm,
    navigate,
  };
};