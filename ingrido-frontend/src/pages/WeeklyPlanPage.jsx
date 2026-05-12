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
} from "lucide-react";

// --- Meal Card Component ---
const MealCard = ({ meal, mealType, onViewVideo, onOrderPandamart }) => {
  if (!meal) return null;
  
  return (
    <div className="p-5 hover:bg-secondary/20 transition border-b last:border-b-0 border-border">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <ChefHat className="h-4 w-4 text-[#b17b46]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#b17b46]">
              {mealType}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {meal.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {meal.description}
          </p>

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
const DaySchedule = ({ dayData, onViewVideo, onOrderPandamart }) => {
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
          />
        )}
        {dayData.lunch && (
          <MealCard
            meal={dayData.lunch}
            mealType="Lunch"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
          />
        )}
        {dayData.dinner && (
          <MealCard
            meal={dayData.dinner}
            mealType="Dinner"
            onViewVideo={onViewVideo}
            onOrderPandamart={onOrderPandamart}
          />
        )}
      </div>
    </div>
  );
};

// --- Diet Option Card Component ---
const DietOptionCard = ({ icon: Icon, title, description, isSelected, isRecommended, onClick }) => {
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

// --- Main WeeklyPlanPage Component ---
const WeeklyPlanPage = () => {
  const navigate = useNavigate();
  const BACKEND_URL = "http://127.0.0.1:8000";

  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [showOptions, setShowOptions] = useState(true);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [planCreatedAt, setPlanCreatedAt] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [userHealthPrefs, setUserHealthPrefs] = useState({ health_conditions: [], dietary_preferences: [] });

  // Diet options
  const dietOptions = [
    {
      id: "without_preference",
      title: "Without Health Preference",
      description: "No specific dietary restrictions - enjoy a variety of meals",
      icon: User,
    },
    {
      id: "lite",
      title: "Lite & Healthy",
      description: "Low calorie, nutritious meals with balanced portions",
      icon: Salad,
    },
    {
      id: "spicy",
      title: "Spicy & Flavorful",
      description: "Bold flavors, aromatic spices, and a kick of heat",
      icon: SpicyIcon,
    },
    {
      id: "balanced",
      title: "Balanced",
      description: "Perfect mix of taste, nutrition, and satisfaction",
      icon: Heart,
    },
  ];

  // Fetch user health preferences from backend
  const fetchUserHealthPreferences = async () => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) return null;

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/accounts/user/health-preferences/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      setUserHealthPrefs(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching health preferences:", error);
      return null;
    }
  };

  // Check for existing saved plan
  const checkSavedPlan = async () => {
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      setShowOptions(true);
      return;
    }

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/accounts/meal-planner/current/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      if (response.data.has_saved_plan) {
        if (response.data.is_expired) {
          setIsExpired(true);
          setDaysRemaining(0);
          console.log("Plan expired, generating new one...");
          await generateMealPlan(response.data.diet_type, true);
        } else {
          setWeeklyPlan(response.data.weekly_plan);
          setSelectedDiet(response.data.diet_type);
          setCurrentPlanId(response.data.plan_id);
          setPlanCreatedAt(response.data.created_at);
          setDaysRemaining(response.data.days_remaining);
          setIsExpired(false);
          setShowOptions(false);
        }
      }
    } catch (error) {
      console.error("Error checking saved plan:", error);
      setShowOptions(true);
    }
  };

  // Generate meal plan using backend API
  const generateMealPlan = async (dietType, isAutoRegenerate = false) => {
    const token = localStorage.getItem("ingrido_token");

    try {
      setGenerating(true);
      setError(null);
      
      if (!isAutoRegenerate) {
        setShowOptions(false);
      }

      if (token) {
        const response = await axios.post(
          `${BACKEND_URL}/api/accounts/meal-planner/generate/`,
          { diet_type: dietType },
          { headers: { Authorization: `Token ${token}` } }
        );
        
        setWeeklyPlan(response.data.weekly_plan);
        setSelectedDiet(dietType);
        setCurrentPlanId(response.data.plan_id);
        setPlanCreatedAt(response.data.created_at);
        setIsExpired(false);
        setDaysRemaining(7);
        setShowOptions(false);
        
        if (!isAutoRegenerate) {
          const healthMsg = response.data.used_preferences?.health_conditions?.length > 0 
            ? `Using your health preferences: ${response.data.used_preferences.health_conditions.join(", ")}`
            : "Plan generated successfully!";
          console.log(healthMsg);
        }
      } else {
        console.log("User not logged in, using mock data");
        setTimeout(() => {
          const mockData = getMock7DayMealPlan(dietType);
          setWeeklyPlan(mockData);
          setSelectedDiet(dietType);
          setShowOptions(false);
          setGenerating(false);
        }, 1500);
        return;
      }
      
    } catch (error) {
      console.error("Error generating meal plan:", error);
      const mockData = getMock7DayMealPlan(dietType);
      setWeeklyPlan(mockData);
      setSelectedDiet(dietType);
      setShowOptions(false);
      setError(null);
      
    } finally {
      setGenerating(false);
    }
  };

  // Delete saved plan
  const handleDeletePlan = async () => {
    const token = localStorage.getItem("ingrido_token");
    
    if (!token) {
      setWeeklyPlan([]);
      setShowOptions(true);
      setSelectedDiet(null);
      return;
    }
    
    if (!currentPlanId) return;
    
    const confirmDelete = window.confirm("Are you sure? This will delete your saved meal plan permanently.");
    if (!confirmDelete) return;
    
    try {
      await axios.delete(
        `${BACKEND_URL}/api/accounts/meal-planner/delete/${currentPlanId}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      
      setWeeklyPlan([]);
      setCurrentPlanId(null);
      setPlanCreatedAt(null);
      setShowOptions(true);
      setSelectedDiet(null);
      
      alert("Meal plan deleted successfully!");
      
    } catch (error) {
      console.error("Error deleting plan:", error);
      alert("Failed to delete plan");
    }
  };

  // Regenerate plan (with same diet)
  const handleRegenerate = async () => {
    const token = localStorage.getItem("ingrido_token");
    
    if (token && currentPlanId) {
      try {
        setGenerating(true);
        const response = await axios.post(
          `${BACKEND_URL}/api/accounts/meal-planner/regenerate/`,
          {},
          { headers: { Authorization: `Token ${token}` } }
        );
        
        setWeeklyPlan(response.data.weekly_plan);
        setCurrentPlanId(response.data.plan_id);
        setPlanCreatedAt(response.data.created_at);
        setIsExpired(false);
        setDaysRemaining(7);
        
      } catch (error) {
        console.error("Error regenerating plan:", error);
        if (selectedDiet) {
          await generateMealPlan(selectedDiet);
        }
      } finally {
        setGenerating(false);
      }
    } else if (selectedDiet) {
      await generateMealPlan(selectedDiet);
    } else {
      setShowOptions(true);
      setError("Please select a diet preference first");
    }
  };

  // Handle diet selection
  const handleDietSelect = (dietId) => {
    setSelectedDiet(dietId);
    generateMealPlan(dietId);
  };

  // Handle video view
  const handleViewVideo = (videoUrl) => {
    if (videoUrl) {
      window.open(videoUrl, "_blank");
    } else {
      alert("Video tutorial coming soon!");
    }
  };

  // Handle Pandamart order
  const handleOrderPandamart = (mealTitle) => {
    window.open(`https://pandamart.com/search?q=${encodeURIComponent(mealTitle)}`, "_blank");
  };

  // Reset and show options again
  const handleNewPlan = () => {
    setWeeklyPlan([]);
    setSelectedDiet(null);
    setShowOptions(true);
    setError(null);
    setCurrentPlanId(null);
  };

  // Mock data fallback
  const getMock7DayMealPlan = (dietType) => {
    const allMeals = {
      lite: {
        breakfast: [
          { title: "Oatmeal with Berries", description: "Hearty oatmeal topped with fresh berries and honey", calories: 350, prep_time: 15 },
          { title: "Greek Yogurt Parfait", description: "Yogurt with granola and mixed berries", calories: 320, prep_time: 10 },
          { title: "Avocado Toast", description: "Whole grain toast with mashed avocado and seeds", calories: 380, prep_time: 12 },
        ],
        lunch: [
          { title: "Grilled Chicken Salad", description: "Fresh greens with grilled chicken and light vinaigrette", calories: 450, prep_time: 20 },
          { title: "Quinoa Bowl", description: "Quinoa with roasted vegetables and tahini", calories: 420, prep_time: 25 },
          { title: "Lentil Soup", description: "Protein-rich lentil soup", calories: 350, prep_time: 35 },
        ],
        dinner: [
          { title: "Steamed Fish with Vegetables", description: "Lightly seasoned fish with steamed broccoli", calories: 380, prep_time: 25 },
          { title: "Grilled Tofu", description: "Marinated tofu with stir-fried vegetables", calories: 350, prep_time: 25 },
          { title: "Chicken Breast with Quinoa", description: "Lean chicken breast with quinoa salad", calories: 420, prep_time: 30 },
        ]
      },
      spicy: {
        breakfast: [
          { title: "Spicy Egg Bhurji", description: "Indian-style spiced scrambled eggs", calories: 420, prep_time: 20, spice_level: "Medium" },
          { title: "Masala Omelette", description: "Spicy omelette with onions and chilies", calories: 380, prep_time: 15, spice_level: "Hot" },
        ],
        lunch: [
          { title: "Chicken Karahi", description: "Wok-cooked chicken with tomatoes and green chilies", calories: 580, prep_time: 40, spice_level: "Hot" },
          { title: "Biryani", description: "Fragrant spicy chicken biryani", calories: 650, prep_time: 45, spice_level: "Medium" },
        ],
        dinner: [
          { title: "Spicy Grilled Fish", description: "Fish marinated in spicy masala", calories: 450, prep_time: 35, spice_level: "Medium" },
          { title: "Peri-Peri Chicken", description: "Grilled chicken with peri-peri sauce", calories: 480, prep_time: 40, spice_level: "Hot" },
        ]
      },
      balanced: {
        breakfast: [
          { title: "Whole Grain Toast with Eggs", description: "Perfect protein-rich breakfast", calories: 400, prep_time: 15 },
          { title: "Pancakes with Honey", description: "Whole wheat pancakes with honey", calories: 420, prep_time: 20 },
        ],
        lunch: [
          { title: "Daal Chawal", description: "Yellow lentils with rice", calories: 550, prep_time: 35 },
          { title: "Chicken Stir Fry", description: "Chicken with mixed vegetables", calories: 520, prep_time: 25 },
        ],
        dinner: [
          { title: "Grilled Chicken with Vegetables", description: "Balanced meal with protein and fiber", calories: 480, prep_time: 30 },
          { title: "Fish with Rice", description: "Grilled fish served with brown rice", calories: 490, prep_time: 35 },
        ]
      }
    };

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    if (dietType === 'without_preference') {
      const allBreakfast = [...allMeals.lite.breakfast, ...allMeals.spicy.breakfast, ...allMeals.balanced.breakfast];
      const allLunch = [...allMeals.lite.lunch, ...allMeals.spicy.lunch, ...allMeals.balanced.lunch];
      const allDinner = [...allMeals.lite.dinner, ...allMeals.spicy.dinner, ...allMeals.balanced.dinner];
      
      return days.map(day => ({
        day: day,
        breakfast: allBreakfast[Math.floor(Math.random() * allBreakfast.length)],
        lunch: allLunch[Math.floor(Math.random() * allLunch.length)],
        dinner: allDinner[Math.floor(Math.random() * allDinner.length)],
      }));
    }

    const meals = allMeals[dietType];
    return days.map((day, i) => ({
      day: day,
      breakfast: meals.breakfast[i % meals.breakfast.length],
      lunch: meals.lunch[i % meals.lunch.length],
      dinner: meals.dinner[i % meals.dinner.length],
    }));
  };

  // Initialize page
  useEffect(() => {
    const init = async () => {
      await fetchUserHealthPreferences();
      await checkSavedPlan();
    };
    init();
  }, []);

  const hasHealthConditions = userHealthPrefs.health_conditions && userHealthPrefs.health_conditions.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-[#b17b46] transition"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-sm text-foreground">Meal Planner</span>
        </div>

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#b17b46]/10 rounded-lg">
                <Calendar className="h-8 w-8 text-[#b17b46]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                Weekly Meal Plan
              </h1>
            </div>
            <p className="text-muted-foreground">
              {hasHealthConditions 
                ? `🍃 Personalized for: ${userHealthPrefs.health_conditions.join(", ")}`
                : "Your personalized 7-day meal schedule based on your preferences."}
            </p>
            {daysRemaining > 0 && !showOptions && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Plan expires in {daysRemaining} days • Created: {planCreatedAt ? new Date(planCreatedAt).toLocaleDateString() : 'recently'}
              </p>
            )}
            {isExpired && !showOptions && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Your plan has expired. Generating new one...
              </p>
            )}
          </div>

          {weeklyPlan.length > 0 && !showOptions && (
            <div className="flex gap-3">
              <button
                onClick={handleRegenerate}
                disabled={generating}
                className="flex items-center gap-2 px-6 py-3 bg-[#b17b46] text-white font-semibold rounded-xl shadow-lg shadow-[#b17b46]/20 hover:bg-[#8B5E3C] transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
                {generating ? "Generating..." : "Regenerate"}
              </button>
              <button
                onClick={handleDeletePlan}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {showOptions && (
          <div className="mb-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Choose Your Preference
              </h2>
              <p className="text-muted-foreground">
                {hasHealthConditions 
                  ? `Based on your health profile: ${userHealthPrefs.health_conditions.join(", ")}`
                  : "Select how you want your meals to be prepared for the entire week"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {dietOptions.map((option) => (
                <DietOptionCard
                  key={option.id}
                  icon={option.icon}
                  title={option.title}
                  description={option.description}
                  isSelected={selectedDiet === option.id}
                  isRecommended={hasHealthConditions && option.id === 'lite'}
                  onClick={() => handleDietSelect(option.id)}
                />
              ))}
            </div>

            {generating && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#b17b46] mx-auto mb-3" />
                <p className="text-muted-foreground">
                  Creating your 7-day personalized meal plan...
                </p>
              </div>
            )}
          </div>
        )}

        {weeklyPlan.length > 0 && !showOptions && !isExpired && (
          <>
            <div className="mb-8 rounded-lg border border-[#b17b46]/30 bg-[#b17b46]/5 p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-[#b17b46] mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Chef's Tip!</h3>
                  <p className="text-sm text-muted-foreground">
                    Not feeling these recipes? Click the <b>Regenerate</b> button to get a brand new 7-day meal plan.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-4 text-right text-sm text-muted-foreground">
              Showing {weeklyPlan.length} days plan • {selectedDiet === 'without_preference' ? '🌿 No Health Preference' : 
                selectedDiet === 'lite' ? '🥗 Lite & Healthy' :
                selectedDiet === 'spicy' ? '🌶️ Spicy' : '⚖️ Balanced'} preference
            </div>
            <div id="meal-plan" className="space-y-6">
              {weeklyPlan.map((day, index) => (
                <DaySchedule
                  key={index}
                  dayData={day}
                  onViewVideo={handleViewVideo}
                  onOrderPandamart={handleOrderPandamart}
                />
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={handleNewPlan}
                className="px-6 py-2 border-2 border-[#b17b46] text-[#b17b46] rounded-lg hover:bg-[#b17b46] hover:text-white transition"
              >
                Create New Plan with Different Preference
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default WeeklyPlanPage;