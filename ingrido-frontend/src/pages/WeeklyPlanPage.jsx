import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
  Calendar,
  RefreshCw,
  Info,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  Flame,
  ChefHat,
  Salad,
  Flame as SpicyIcon,
  Heart,
  User,
  Video,
  ShoppingBag,
  Trash2,
  Droplet,
  Activity,
  Apple,
  Utensils,
} from "lucide-react";

// --- Meal Card Component ---
const MealCard = ({ meal, mealType, onViewVideo, onOrderPandamart, onTitleClick }) => {
  if (!meal) return null;
  
  return (
    <div className="p-5 transition border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="h-4 w-4 text-[#b17b46]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b17b46]">
              {mealType}
            </span>
          </div>
          {/* Recipe title - clickable with underline on hover */}
          <button
            onClick={() => onTitleClick(meal)}
            className="text-left group w-full"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:underline group-hover:text-[#b17b46] transition-colors">
              {meal.title}
            </h3>
          </button>
          <p className="text-sm text-muted-foreground mb-3">
            {meal.description}
          </p>

          {/* Dietary Tag */}
          {meal.dietary_type && (
            <div className="mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                meal.dietary_type === 'veg' 
                  ? 'bg-green-100 text-green-700' 
                  : meal.dietary_type === 'non_veg'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {meal.dietary_type === 'veg' ? '🌱 Vegetarian' : 
                 meal.dietary_type === 'non_veg' ? '🍗 Non-Veg' : '🥘 Mixed'}
              </span>
            </div>
          )}

          {/* Nutrition Info */}
          {(meal.calories || meal.prep_time) && (
            <div className="flex gap-4 text-xs mb-3">
              {meal.calories && (
                <div className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-muted-foreground" />
                  <span>{meal.calories} kcal</span>
                </div>
              )}
              {meal.prep_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{meal.prep_time} mins</span>
                </div>
              )}
              {meal.spice_level && (
                <div className="flex items-center gap-1">
                  <SpicyIcon className="h-3 w-3 text-red-500" />
                  <span>{meal.spice_level}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {onViewVideo && (
              <button
                onClick={() => onViewVideo(meal.video_url)}
                className="flex items-center gap-1 text-xs text-[#b17b46] hover:text-[#8B5E3C] transition"
              >
                <Video className="h-3 w-3" />
                Watch Video
              </button>
            )}
            {onOrderPandamart && (
              <button
                onClick={() => onOrderPandamart(meal.title)}
                className="flex items-center gap-1 text-xs text-[#b17b46] hover:text-[#8B5E3C] transition"
              >
                <ShoppingBag className="h-3 w-3" />
                Order on Pandamart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Day Schedule Component ---
const DaySchedule = ({ dayData, onViewVideo, onOrderPandamart, onRecipeTitleClick }) => {
  if (!dayData) return null;
  
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="bg-gradient-to-r from-[#b17b46] to-[#8B5E3C] px-6 py-4">
        <h2 className="text-xl font-bold text-white">{dayData.day}</h2>
        {dayData.date && (
          <p className="text-sm text-white/80 mt-1">{dayData.date}</p>
        )}
        {dayData.health_note && (
          <p className="text-xs text-white/70 mt-1">{dayData.health_note}</p>
        )}
      </div>

      <div className="divide-y divide-border">
        {dayData.breakfast && (
          <MealCard
            meal={dayData.breakfast}
            mealType="Breakfast"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
        {dayData.lunch && (
          <MealCard
            meal={dayData.lunch}
            mealType="Lunch"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
        {dayData.dinner && (
          <MealCard
            meal={dayData.dinner}
            mealType="Dinner"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
            onTitleClick={onRecipeTitleClick}
          />
        )}
      </div>
    </div>
  );
};

// --- Health Condition Card Component ---
const HealthConditionCard = ({ icon: Icon, title, description, isSelected, isRecommended, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all relative ${
        isSelected
          ? "border-[#b17b46] bg-[#b17b46]/10 shadow-lg"
          : "border-border bg-card hover:border-[#b17b46]/50"
      } ${isRecommended ? "ring-2 ring-green-500" : ""}`}
    >
      {isRecommended && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Recommended
        </span>
      )}
      <div
        className={`p-3 rounded-full mb-3 ${
          isSelected ? "bg-[#b17b46] text-white" : "bg-secondary text-[#b17b46]"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
};

// --- Dietary Preference Card Component ---
const DietaryPreferenceCard = ({ icon: Icon, title, description, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-[#b17b46] bg-[#b17b46]/10 shadow-lg"
          : "border-border bg-card hover:border-[#b17b46]/50"
      }`}
    >
      <div
        className={`p-2 rounded-full mb-2 ${
          isSelected ? "bg-[#b17b46] text-white" : "bg-secondary text-[#b17b46]"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </button>
  );
};

// --- Main WeeklyPlanPage Component ---
const WeeklyPlanPage = () => {
  const navigate = useNavigate();
  const BACKEND_URL = "http://127.0.0.1:8000";

  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedHealthCondition, setSelectedHealthCondition] = useState(null);
  const [selectedDietaryPref, setSelectedDietaryPref] = useState(null);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [planCreatedAt, setPlanCreatedAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const healthOptions = [
    { id: "diabetes", title: "Diabetes", description: "Low sugar, controlled carbs", icon: Droplet },
    { id: "blood_pressure", title: "Blood Pressure", description: "Low sodium, heart-healthy", icon: Activity },
    { id: "heart_condition", title: "Heart Condition", description: "Low cholesterol, lean proteins", icon: Heart },
    { id: "balanced", title: "Balanced", description: "Perfect mix of taste and nutrition", icon: Apple },
  ];

  const dietaryOptions = [
    { id: "veg", title: "Vegetarian", description: "Plant-based meals only", icon: Salad },
    { id: "non_veg", title: "Non-Vegetarian", description: "Includes meat and eggs", icon: ChefHat },
    { id: "both", title: "Both", description: "Mix of veg & non-veg", icon: Utensils },
  ];

  // Handler for clicking on a recipe title
  const handleRecipeTitleClick = (meal) => {
    if (!meal || !meal.title) {
      console.error("No meal title provided");
      return;
    }
    
    // Encode the title to handle special characters and spaces
    const encodedTitle = encodeURIComponent(meal.title);
    console.log("Navigating to recipe:", meal.title);
    console.log("Encoded title:", encodedTitle);
    
    // Navigate to recipe detail page with title parameter
    navigate(`/recipe?title=${encodedTitle}`);
  };

  // Generate function - uses current selected preferences
  const generateMealPlan = async (healthCondition, dietaryPref) => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      setError("Please login to generate meal plans");
      return;
    }

    // If no preferences provided, try to use existing ones
    if (!healthCondition || !dietaryPref) {
      setError("Please select both health condition and dietary preference");
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      const response = await axios.post(
        `${BACKEND_URL}/api/accounts/meal-planner/generate/`,
        { health_condition: healthCondition, dietary_preference: dietaryPref },
        { headers: { Authorization: `Token ${token}` } }
      );
      
      console.log("Generated plan:", response.data);
      
      setWeeklyPlan(response.data.weekly_plan);
      setCurrentPlanId(response.data.plan_id);
      setPlanCreatedAt(new Date().toISOString());
      setIsExpired(false);
      setDaysRemaining(7);
      
      // Store in localStorage as backup
      localStorage.setItem('current_meal_plan', JSON.stringify({
        weekly_plan: response.data.weekly_plan,
        plan_id: response.data.plan_id,
        created_at: new Date().toISOString(),
        health_condition: healthCondition,
        dietary_pref: dietaryPref
      }));
    } catch (error) {
      console.error("Generate error:", error);
      setError(error.response?.data?.error || "Failed to generate plan. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  // Regenerate with current preferences
  const handleRegenerate = () => {
    if (selectedHealthCondition && selectedDietaryPref) {
      generateMealPlan(selectedHealthCondition, selectedDietaryPref);
    } else {
      setError("Please select both health condition and dietary preference to regenerate");
    }
  };

  // Check for existing plan on component mount
  useEffect(() => {
    const checkSavedPlan = async () => {
      const token = localStorage.getItem("ingrido_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(`${BACKEND_URL}/api/accounts/meal-planner/current/`, {
          headers: { Authorization: `Token ${token}` }
        });

        console.log("API Response:", response.data);

        if (response.data && response.data.weekly_plan && response.data.weekly_plan.length > 0) {
          setWeeklyPlan(response.data.weekly_plan);
          setCurrentPlanId(response.data.plan_id);
          setPlanCreatedAt(response.data.created_at);
          setIsExpired(false);
          
          // Restore selected preferences from the plan data
          if (response.data.health_condition) {
            setSelectedHealthCondition(response.data.health_condition);
          }
          if (response.data.dietary_preference) {
            setSelectedDietaryPref(response.data.dietary_preference);
          }
          
          // Calculate days remaining
          if (response.data.created_at) {
            const createdDate = new Date(response.data.created_at);
            const now = new Date();
            const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            const remaining = Math.max(0, 7 - daysDiff);
            setDaysRemaining(remaining);
            
            if (remaining === 0) {
              setIsExpired(true);
            }
          }
        } else if (response.data && response.data.message === 'Plan expired after 7 days') {
          setIsExpired(true);
          setWeeklyPlan([]);
          setCurrentPlanId(null);
          localStorage.removeItem('current_meal_plan');
        } else {
          // Try localStorage backup
          const savedPlan = localStorage.getItem('current_meal_plan');
          if (savedPlan) {
            const parsedPlan = JSON.parse(savedPlan);
            const createdDate = new Date(parsedPlan.created_at);
            const now = new Date();
            const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 7) {
              setWeeklyPlan(parsedPlan.weekly_plan);
              setCurrentPlanId(parsedPlan.plan_id);
              setSelectedHealthCondition(parsedPlan.health_condition);
              setSelectedDietaryPref(parsedPlan.dietary_pref);
              setDaysRemaining(7 - daysDiff);
            } else {
              localStorage.removeItem('current_meal_plan');
            }
          }
        }
      } catch (error) {
        console.log("No existing active plan found:", error);
        
        // Try localStorage backup
        const savedPlan = localStorage.getItem('current_meal_plan');
        if (savedPlan) {
          try {
            const parsedPlan = JSON.parse(savedPlan);
            const createdDate = new Date(parsedPlan.created_at);
            const now = new Date();
            const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff < 7) {
              setWeeklyPlan(parsedPlan.weekly_plan);
              setCurrentPlanId(parsedPlan.plan_id);
              setSelectedHealthCondition(parsedPlan.health_condition);
              setSelectedDietaryPref(parsedPlan.dietary_pref);
              setDaysRemaining(7 - daysDiff);
            }
          } catch (e) {
            console.error("Error parsing localStorage plan:", e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSavedPlan();
  }, []);

  const handleHealthConditionSelect = (healthId) => {
    setSelectedHealthCondition(healthId);
    if (selectedDietaryPref) {
      generateMealPlan(healthId, selectedDietaryPref);
    }
  };

  const handleDietaryPrefSelect = (prefId) => {
    setSelectedDietaryPref(prefId);
    if (selectedHealthCondition) {
      generateMealPlan(selectedHealthCondition, prefId);
    }
  };

  const handleDeletePlan = async () => {
    const token = localStorage.getItem("ingrido_token");
    if (!token || !currentPlanId) return;
    if (!window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/accounts/meal-planner/delete/${currentPlanId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      handleClearPlan();
    } catch (error) { 
      console.error("Delete error:", error);
      setError("Failed to delete plan"); 
    }
  };

  const handleClearPlan = () => {
    setWeeklyPlan([]);
    setSelectedHealthCondition(null);
    setSelectedDietaryPref(null);
    setCurrentPlanId(null);
    setIsExpired(false);
    setDaysRemaining(0);
    localStorage.removeItem('current_meal_plan');
  };

  const handleViewVideo = (url) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Video coming soon for this recipe!");
    }
  };
  
  const handleOrderPandamart = (title) => {
    window.open(`https://www.foodpanda.pk/brand/pandamart?q=${encodeURIComponent(title)}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#b17b46] mx-auto mb-3" />
          <p className="text-muted-foreground">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-[#b17b46]">Home</Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-sm text-foreground">Meal Planner</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#b17b46]/10 rounded-lg">
                <Calendar className="h-8 w-8 text-[#b17b46]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Weekly Meal Plan</h1>
            </div>
            <p className="text-muted-foreground">Select your preferences to generate a personalized 7-day meal plan.</p>
            {daysRemaining > 0 && weeklyPlan.length > 0 && !isExpired && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Plan active for {daysRemaining} more {daysRemaining === 1 ? 'day' : 'days'}
              </p>
            )}
            {isExpired && weeklyPlan.length > 0 && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ This plan has expired. Please generate a new plan.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          {weeklyPlan.length > 0 && !isExpired && (
            <div className="flex gap-3">
              <button 
                onClick={handleRegenerate} 
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-[#b17b46] text-white rounded-xl shadow-lg hover:bg-[#8B5E3C] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={generating ? "animate-spin" : ""} /> 
                {generating ? "Generating..." : "Regenerate"}
              </button>
              <button 
                onClick={handleDeletePlan} 
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                <Trash2 /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle /> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-700 hover:text-red-900">×</button>
          </div>
        )}

        {/* Options Section - Only show when no active plan or plan expired */}
        {(weeklyPlan.length === 0 || isExpired) && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-center mb-8">Choose Your Preferences</h2>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-center mb-4">Health Condition</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthOptions.map((option) => (
                  <HealthConditionCard 
                    key={option.id} 
                    {...option} 
                    isSelected={selectedHealthCondition === option.id} 
                    onClick={() => handleHealthConditionSelect(option.id)} 
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-center mb-4">Dietary Preference</h3>
              <div className="flex justify-center gap-6 flex-wrap">
                {dietaryOptions.map((option) => (
                  <DietaryPreferenceCard 
                    key={option.id} 
                    {...option} 
                    isSelected={selectedDietaryPref === option.id} 
                    onClick={() => handleDietaryPrefSelect(option.id)} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {generating && (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#b17b46] mx-auto mb-3" />
            <p className="text-muted-foreground">Creating your personalized 7-day plan...</p>
          </div>
        )}

        {/* Plan Section */}
        {weeklyPlan.length > 0 && !generating && !isExpired && (
          <div id="meal-plan" className="space-y-6 mt-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-[#b17b46] rounded-full"></div>
              <h2 className="text-2xl font-bold">Your Weekly Meal Plan</h2>
            </div>
            
            {weeklyPlan.map((day, index) => (
              <DaySchedule 
                key={index} 
                dayData={day} 
                onViewVideo={handleViewVideo} 
                onOrderPandamart={handleOrderPandamart}
                onRecipeTitleClick={handleRecipeTitleClick}
              />
            ))}
            
            <div className="mt-10 text-center">
              <button 
                onClick={handleClearPlan} 
                className="px-6 py-2 border-2 border-gray-400 text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                Clear Plan & Start Over
              </button>
            </div>
          </div>
        )}

        {/* Expired Plan Message */}
        {weeklyPlan.length > 0 && isExpired && !generating && (
          <div className="text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
            <Calendar className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
            <p className="text-yellow-700 mb-4">Your previous meal plan has expired after 7 days.</p>
            <button 
              onClick={() => {
                handleClearPlan();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2 bg-[#b17b46] text-white rounded-lg hover:bg-[#8B5E3C] transition"
            >
              Create New Plan
            </button>
          </div>
        )}

        {/* Empty State */}
        {weeklyPlan.length === 0 && !generating && !isExpired && (
          <div className="text-center py-12 bg-secondary/20 rounded-xl">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Select health and diet options above to see your plan.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeeklyPlanPage;