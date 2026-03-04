import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 1. Import the Auth hook

export function useRegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Get the login function

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    family: "",
    city: "",
    healthConditions: [],
    dietaryPreferences: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (category, option) => {
    setFormData((prev) => {
      const currentList = prev[category];
      const newList = currentList.includes(option)
        ? currentList.filter((item) => item !== option)
        : [...currentList, option];
      return { ...prev, [category]: newList };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting Registration Data:", formData);
    
    // 3. Update Global Auth State
    // This triggers the Navbar change app-wide
    login(); 

    // 4. Redirect to Dashboard
    navigate("/dashboard"); 
  };

  return { formData, handleChange, handleCheckboxChange, handleSubmit };
}