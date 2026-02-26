
import { useState } from "react";
import {
  UtensilsCrossed,
  User,
  Users,
  MapPin,
  Heart,
  Salad,
  ArrowRight,
  Mail,
  Lock
} from "lucide-react";
export function UserRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    family: '',
    city: '',
    healthConditions: [],
    dietaryPreferences: []
  });

  const healthOptions = [
    "Diabetes", "High Blood Pressure", "Heart Disease", 
    "Allergies", "Gluten Intolerance", "Lactose Intolerance"
  ];

  const dietOptions = [
    "Vegetarian", "Vegan", "Pescatarian", 
    "Keto", "Low Carb", "High Protein"
  ];
  return (
    // Updated background to use your theme's background color
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 bg-background font-sans">
      <div className="w-full max-w-2xl animate-fade-up">
        {/* Card - Using your theme's card color, border, and custom shadow */}
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-card border border-border">
          <div className="text-center mb-8">
            {/* Playfair Display applied to Heading */}
            <h1 className="text-4xl font-bold mb-3 font-display text-foreground">Create Your Profile</h1>
            <p className="text-muted-foreground">Tell us about yourself to get personalized meal plans</p>
          </div>

          <form className="space-y-6">
            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <User className="h-4 w-4 text-secondary" /> Your Name *
                </label>
                <input 
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all placeholder:text-muted-foreground" 
                  placeholder="Enter your name" 
                  required 
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-secondary" /> Email Address *
                </label>
                <input 
                  type="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all" 
                  placeholder="name@example.com" 
                  required 
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                  <Lock className="h-4 w-4 text-secondary" /> Password *
                </label>
                <input 
                  type="password"
                  className="w-full rounded-md border border-input bg-background px-3 py-2.5 focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all" 
                  placeholder="••••••••" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Family Members Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4 text-secondary" /> Family Members
                  </label>
                  <input 
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 focus:ring-2 focus:ring-ring outline-none" 
                    placeholder="e.g., 2 adults" 
                  />
                </div>

                {/* Location Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-secondary" /> City / Location *
                  </label>
                  <input 
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 focus:ring-2 focus:ring-ring outline-none" 
                    placeholder="Enter your city" 
                    required 
                  />
                </div>
              </div>
            </div>

            <hr className="border-border my-8" />

            {/* Checkbox Sections */}
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Heart className="h-4 w-4 text-secondary" /> Health Conditions
              </label>
              <div className="grid grid-cols-2 gap-3">
                {healthOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-transparent hover:border-border cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-input text-primary focus:ring-ring" />
                    <span className="text-sm text-muted-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Salad className="h-4 w-4 text-secondary" /> Dietary Preferences
              </label>
              <div className="grid grid-cols-2 gap-3">
                {dietOptions.map(option => (
                  <label key={option} className="flex items-center space-x-2 bg-background/50 p-2 rounded-md border border-transparent hover:border-border cursor-pointer transition-colors">
                    <input type="checkbox" className="rounded border-input text-primary focus:ring-ring" />
                    <span className="text-sm text-muted-foreground">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button - Using Secondary color from your theme */}
            <button 
              type="submit" 
              className="w-full bg-secondary hover:opacity-90 text-secondary-foreground font-semibold py-4 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:shadow-card-hover text-lg mt-8"
            >
              Create My Profile <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account? <a className="text-secondary font-medium hover:underline" href="/dashboard">Go to Dashboard</a>
          </p>
        </div>
      </div>
    </div>
  );
}