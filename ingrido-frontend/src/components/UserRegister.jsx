import { useState } from "react";
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
import { useRegisterForm } from "../hooks/UserRegisterForm";
import { HEALTH_OPTIONS, DIET_OPTIONS } from "../utils/RegistrationOption";
export function UserRegister() {
  const { formData, handleChange, handleCheckboxChange, handleSubmit } =
    useRegisterForm();
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  // Password Validations
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
  const handleOnSubmit = async (e) => {
    await handleSubmit(e);
    if (formData.name) {
      localStorage.setItem("user_name", formData.name);
      window.dispatchEvent(new Event("storage_updated"));
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 bg-background font-sans">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-card border border-border">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3 font-display text-foreground tracking-tight">
              Create Account
            </h1>
            <p className="text-muted-foreground text-sm">
              Join Ingrido to start your personalized nutrition plan.
            </p>
          </div>
          <form onSubmit={handleOnSubmit} className="space-y-6">
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
                          className={`flex items-center gap-2 text-[13px] ${v.met ? "text-green-600 font-medium" : "text-muted-foreground opacity-60"}`}
                        >
                          {v.met ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
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
                      onChange={() =>
                        handleCheckboxChange("healthConditions", option)
                      }
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                    <span className="text-sm font-medium text-foreground/80">
                      {option}
                    </span>
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
                      onChange={() =>
                        handleCheckboxChange("dietaryPreferences", option)
                      }
                      className="h-4 w-4 rounded border-input text-primary"
                    />
                    <span className="text-sm font-medium text-foreground/80">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={!isPasswordValid}
              className={`w-full font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 text-lg mt-10 transition-all 
                ${isPasswordValid ? "bg-primary hover:bg-primary/90 text-white shadow-xl active:scale-[0.98]" : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"}`}
            >
              Sign Up <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
