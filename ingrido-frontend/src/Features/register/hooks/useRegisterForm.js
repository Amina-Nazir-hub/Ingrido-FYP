import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuth } from "../../../context/AuthContext";
import { registerService } from "../services/registerService";
import { STORAGE_KEYS, ROUTES, PASSWORD_VALIDATIONS } from "../constants";
import { 
  showErrorAlert, 
  showSuccessAlert, 
  showLoadingAlert,
  closeAlert 
} from "../../shared/utils/alertUtils";

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
      showErrorAlert("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      showErrorAlert("Email is required");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      showErrorAlert("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      showErrorAlert("Password is required");
      return false;
    }
    if (!isPasswordValid) {
      showErrorAlert("Please ensure the password meets all security criteria");
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
    
    // Show loading alert
    showLoadingAlert("Creating Account...", "Please wait while we create your account");
    
    try {
      const response = await registerService.register(formData);
      
      // Close loading alert
      closeAlert();
      
      // Store user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.USER_NAME, formData.name);
      
      // Update auth context
      login({ name: formData.name });
      window.dispatchEvent(new Event("storage_updated"));
      
      // Show success message
      await showSuccessAlert(`Welcome ${formData.name}! Your account has been created successfully.`);
      
      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD);
      return true;
    } catch (error) {
      console.error("Registration Error:", error.response?.data || error.message);
      
      // Close loading alert
      closeAlert();
      
      if (error.response?.status === 400) {
        showErrorAlert("Email already exists or invalid data. Please try again.");
      } else if (error.response?.status === 409) {
        showErrorAlert("Email already registered. Please use a different email or login.");
      } else if (error.response?.status === 500) {
        showErrorAlert("Server error. Please try again later.");
      } else {
        showErrorAlert("Registration failed. Please check your connection and try again.");
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
    setError, // Added setError to be used in RegisterPage
  };
};