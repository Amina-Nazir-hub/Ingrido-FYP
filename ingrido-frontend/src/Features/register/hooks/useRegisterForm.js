import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { registerService } from "../services/registerService";
import { STORAGE_KEYS, ROUTES, PASSWORD_VALIDATIONS } from "../constants";

export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    healthConditions: [],
    dietaryPreferences: [],
  });
  
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleHealthConditionsChange = (conditions) => {
    setFormData((prev) => ({ ...prev, healthConditions: conditions }));
  };

  const handleDietaryPreferencesChange = (preferences) => {
    setFormData((prev) => ({ ...prev, dietaryPreferences: preferences }));
  };

  const isPasswordValid = PASSWORD_VALIDATIONS.every(v => v.test(formData.password));

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (!isPasswordValid) {
      setError("Please ensure the password meets all security criteria");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    
    if (!validateForm()) {
      return false;
    }

    setIsLoading(true);
    
    try {
      const response = await registerService.register(formData);
      
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_NAME, formData.name);
      
      login({ name: formData.name });
      window.dispatchEvent(new Event("storage_updated"));
      
      navigate(ROUTES.DASHBOARD);
      return true;
    } catch (error) {
      if (error.response?.status === 400) {
        setError("Email already exists or invalid data. Please try again.");
      } else {
        setError("Registration failed. Please try again later.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    handleChange,
    handleHealthConditionsChange,
    handleDietaryPreferencesChange,
    handleSubmit,
    isPasswordValid,
    isPasswordFocused,
    setIsPasswordFocused,
    isLoading,
    error,
  };
};