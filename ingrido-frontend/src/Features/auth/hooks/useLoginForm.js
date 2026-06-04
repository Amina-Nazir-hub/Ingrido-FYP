import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { API_ENDPOINTS, STORAGE_KEYS, ROUTES, FORM_VALIDATION } from "../constants";

export const useLoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!FORM_VALIDATION.EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < FORM_VALIDATION.PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${FORM_VALIDATION.PASSWORD_MIN_LENGTH} characters`);
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
      const response = await axios.post(API_ENDPOINTS.LOGIN, {
        email: email.trim(),
        password: password
      });

      // Store tokens and user data
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      const userName = response.data.user?.first_name || response.data.first_name || "User";
      localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
      if (response.data.user_id) {
        localStorage.setItem(STORAGE_KEYS.USER_ID, response.data.user_id);
      }
      
      // Update auth context
      login({ name: userName, id: response.data.user_id });
      
      // Dispatch event for other components
      window.dispatchEvent(new Event("storage_updated"));
      
      // Navigate to dashboard
      navigate(ROUTES.DASHBOARD);
      
      return true;
    } catch (error) {
      console.error("Login Error:", error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (error.response?.status === 400) {
        setError(error.response.data?.error || "Please check your credentials");
      } else {
        setError("Network error. Please check your connection.");
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    setError,
    handleSubmit,
  };
};