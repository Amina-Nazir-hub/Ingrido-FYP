import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export function useRegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    healthConditions: [],
    dietaryPreferences: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password validation logic
    const { password } = formData;
    const isPasswordValid = 
      password.length >= 8 && 
      /[A-Z]/.test(password) && 
      /[a-z]/.test(password) && 
      /[0-9]/.test(password) && 
      /[!@#$%^&*(),.?":{}|<>+=-]/.test(password);

    if (!isPasswordValid) {
      alert("Please ensure the password meets all security criteria.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/accounts/register/", {
        first_name: formData.name,
        email: formData.email,
        password: formData.password,
        health_conditions: [],
        dietary_preferences: []
      });

      // Storage aur Context update
      localStorage.setItem("ingrido_token", response.data.token);
      localStorage.setItem("user_name", formData.name);
      
      login({ name: formData.name });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth Exception:", error.response?.data || error.message);
      alert("Registration failed. Email might already exist.");
    }
  };

  return { formData, handleChange, handleSubmit };
}