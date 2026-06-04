import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, BrowserRouter } from "react-router-dom";
import axios from "axios";
import {
  User,
  Heart,
  Salad,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

// --- 1. UTILS & CONSTANTS ---
export const HEALTH_OPTIONS = ["Diabetes", "High Blood Pressure", "Heart Disease"];
export const DIET_OPTIONS = ["Vegetarian", "Non-Vegetarian"];

// --- 2. AUTH CONTEXT ---
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ingrido_token");
    const name = localStorage.getItem("user_name");
    if (token && name) {
      setIsLoggedIn(true);
      setUser({ name });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const name = userData?.name || "User";
    setIsLoggedIn(true);
    setUser({ name });
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("user_name", name);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// --- 3. CUSTOM HOOK ---
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

  const handleCheckboxChange = (category, option) => {
    setFormData((prev) => {
      const currentOptions = prev[category];
      const updatedOptions = currentOptions.includes(option)
        ? currentOptions.filter((item) => item !== option)
        : [...currentOptions, option];
      return { ...prev, [category]: updatedOptions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        health_conditions: formData.healthConditions,
        dietary_preferences: formData.dietaryPreferences,
      });

      localStorage.setItem("ingrido_token", response.data.token);
      localStorage.setItem("user_name", formData.name);
      
      login({ name: formData.name });
      window.dispatchEvent(new Event("storage_updated"));
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Auth Exception:", error.response?.data || error.message);
      alert("Registration failed. Email might already exist.");
    }
  };

  return { formData, handleChange, handleCheckboxChange, handleSubmit };
}

// --- 4. COMPONENT: USER REGISTER ---
export function UserRegister() {
  const { formData, handleChange, handleCheckboxChange, handleSubmit } = useRegisterForm();
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const validations = [
    { label: "Minimum 8 characters", met: formData.password.length >= 8 },
    { label: "Uppercase letter (A-Z)", met: /[A-Z]/.test(formData.password) },
    { label: "Lowercase letter (a-z)", met: /[a-z]/.test(formData.password) },
    { label: "Numerical digit (0-9)", met: /[0-9]/.test(formData.password) },
    {
      label: "Special symbol (!@#$%)",
      met: /[!@#$%^&*(),.?":{}|<>+=-]/.test(formData.password),
    },
  ];

  const isPasswordValid = validations.every((v) => v.met);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 bg-background font-sans text-center">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-card border border-border">
          <div className="mb-10">
            <h1 className="text-4xl font-bold mb-3 font-display text-foreground tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm">
              Join Ingrido to start your personalized nutrition plan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 text-left">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-secondary" /> Full Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-secondary" /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>

              <div className="space-y-2 relative">
                <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                  <Lock className="h-4 w-4 text-secondary" /> Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  className="w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                  required
                />
                {isPasswordFocused && (
                  <div className="absolute z-20 left-0 -bottom-48 w-full sm:w-80 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-slate-900 border-t border-l border-border rotate-45"></div>
                    <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-widest opacity-70">
                      Security Checklist
                    </p>
                    <ul className="space-y-2">
                      {validations.map((v, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-2 text-[13px] ${
                            v.met ? "text-green-600 font-medium" : "text-muted-foreground opacity-60"
                          }`}
                        >
                          {v.met ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          {v.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-border my-10" />

            <div className="space-y-4 text-left">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Heart className="h-4 w-4 text-secondary" /> Health Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {HEALTH_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 bg-background/30 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.healthConditions.includes(option)}
                      onChange={() => handleCheckboxChange("healthConditions", option)}
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                    <span className="text-sm font-medium text-foreground/80">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-left">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Salad className="h-4 w-4 text-secondary" /> Dietary Preferences
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIET_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex items-center space-x-3 bg-background/30 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences.includes(option)}
                      onChange={() => handleCheckboxChange("dietaryPreferences", option)}
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                    <span className="text-sm font-medium text-foreground/80">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPasswordValid}
              className={`w-full font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 text-lg mt-10 transition-all 
                ${
                  isPasswordValid
                    ? "bg-primary hover:bg-primary/90 text-white shadow-xl active:scale-[0.98]"
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                }`}
            >
              Sign Up <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// --- 5. REGISTER PAGE COMPONENT ---
export default function RegisterPage() {
  return (
    <AuthProvider>
      <UserRegister />
    </AuthProvider>
  );
}