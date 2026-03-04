import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // 1. Import the Auth hook

export function useLoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 2. Destructure the login function from context

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in...", loginData);
    
    // 3. Update Global State
    // This tells the Navbar to switch from Image 1 to Image 2
    login(); 

    // 4. Redirect
    // If you want the "Logged In" version of the landing page, 
    // you can navigate to "/" instead of "/dashboard"
    navigate("/dashboard"); 
  };

  return { loginData, handleChange, handleSubmit };
}