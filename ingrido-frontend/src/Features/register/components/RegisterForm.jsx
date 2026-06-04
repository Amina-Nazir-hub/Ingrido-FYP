import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import PasswordStrength from "./PasswordStrength";
import HealthConditionsSelect from "./HealthConditionsSelect";
import DietaryPreferencesSelect from "./DietaryPreferencesSelect";

const RegisterForm = ({
  formData,
  onInputChange,
  onHealthConditionsChange,
  onDietaryPreferencesChange,
  onSubmit,
  isPasswordValid,
  isPasswordFocused,
  setIsPasswordFocused,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 text-left">
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <User className="h-4 w-4 text-secondary" /> Full Name
          </label>
          <input
            name="name"
            value={formData.name}
            onChange={onInputChange}
            className="w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Enter your full name"
            required
            disabled={isLoading}
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
            onChange={onInputChange}
            className="w-full rounded-md border border-input bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="name@example.com"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 relative">
          <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Lock className="h-4 w-4 text-secondary" /> Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={onInputChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className="w-full rounded-md border border-input bg-background px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={formData.password} isFocused={isPasswordFocused} />
        </div>
      </div>

      <hr className="border-border my-10" />

      <HealthConditionsSelect 
        selectedConditions={formData.healthConditions}
        onChange={onHealthConditionsChange}
      />

      <DietaryPreferencesSelect 
        selectedPreferences={formData.dietaryPreferences}
        onChange={onDietaryPreferencesChange}
      />

      <button
        type="submit"
        disabled={!isPasswordValid || isLoading}
        className={`w-full font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 text-lg mt-10 transition-all 
          ${
            isPasswordValid && !isLoading
              ? "bg-primary hover:bg-primary/90 text-white shadow-xl active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
          }`}
      >
        {isLoading ? "Creating Account..." : "Sign Up"}
        <ArrowRight className="h-5 w-5" />
      </button>
    </form>
  );
};

export default RegisterForm;