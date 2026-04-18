import { User, Heart, Salad, ArrowRight, Mail, Lock } from "lucide-react";
import { useRegisterForm } from "../hooks/UserRegisterForm";
import { HEALTH_OPTIONS, DIET_OPTIONS } from "../utils/RegistrationOption";

export function UserRegister() {
  const { formData, handleChange, handleCheckboxChange, handleSubmit } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 bg-background font-sans">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-card border border-border">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 font-display text-foreground">Create Your Profile</h1>
            <p className="text-muted-foreground">Tell us about yourself to get personalized meal plans</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-secondary" /> Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-secondary" /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="john@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2 ">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Lock className="h-4 w-4 text-secondary" /> Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <hr className="border-border my-8" />

            {/* Health Conditions */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Heart className="h-4 w-4 text-secondary" /> Health Conditions
              </label>
              <div className="grid gap-3">
                {HEALTH_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-transparent hover:border-border cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.healthConditions.includes(option)}
                      onChange={() => handleCheckboxChange("healthConditions", option)}
                      className="rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="text-sm text-muted-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Preferences */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Salad className="h-4 w-4 text-secondary" /> Dietary Preferences
              </label>
              <div className="grid gap-3">
                {DIET_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-transparent hover:border-border cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.dietaryPreferences.includes(option)}
                      onChange={() => handleCheckboxChange("dietaryPreferences", option)}
                      className="rounded border-input text-primary focus:ring-ring"
                    />
                    <span className="text-sm text-muted-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full bg-primary hover:bg-secondary text-secondary-foreground font-semibold py-4 px-4 rounded-lg flex items-center justify-center gap-2 text-lg mt-8 transition-all">
              Create My Profile <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}