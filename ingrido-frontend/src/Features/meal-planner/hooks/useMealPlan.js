import { useState, useEffect } from "react";
import { mealPlannerService } from "../services/mealPlannerService";
import { STORAGE_KEYS } from "../constants";
import { 
  showErrorAlert, 
  showLoadingAlert, 
  showSuccessAlert,
  showWarningAlert,
  closeAlert 
} from "../../shared/utils/alertUtils";

export const useMealPlan = () => {
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

  const calculateDaysRemaining = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, 7 - daysDiff);
    if (remaining === 0) setIsExpired(true);
    return remaining;
  };

  const loadSavedPlanFromLocal = () => {
    const savedPlan = localStorage.getItem(STORAGE_KEYS.CURRENT_MEAL_PLAN);
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
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL_PLAN);
      }
    }
    return false;
  };

  const checkSavedPlan = async () => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await mealPlannerService.getCurrentPlan();

      if (data && data.weekly_plan && data.weekly_plan.length > 0) {
        setWeeklyPlan(data.weekly_plan);
        setCurrentPlanId(data.plan_id);
        setPlanCreatedAt(data.created_at);
        setIsExpired(false);
        
        if (data.health_condition) setSelectedHealthCondition(data.health_condition);
        if (data.dietary_preference) setSelectedDietaryPref(data.dietary_preference);
        
        if (data.created_at) {
          const remaining = calculateDaysRemaining(data.created_at);
          setDaysRemaining(remaining);
        }
      } else if (data && data.message === 'Plan expired after 7 days') {
        setIsExpired(true);
        setWeeklyPlan([]);
        setCurrentPlanId(null);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL_PLAN);
      } else {
        loadSavedPlanFromLocal();
      }
    } catch (error) {
      console.log("No existing active plan found:", error);
      loadSavedPlanFromLocal();
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async (healthCondition, dietaryPref) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      showErrorAlert("Please login to generate meal plans");
      setError("Please login to generate meal plans");
      return false;
    }

    if (!healthCondition || !dietaryPref) {
      showErrorAlert("Please select both health condition and dietary preference");
      setError("Please select both health condition and dietary preference");
      return false;
    }

    try {
      setGenerating(true);
      setError(null);
      
      // Show loading alert
      showLoadingAlert("Generating Plan", "Creating your personalized 7-day meal plan...");
      
      console.log("Generating plan with:", { healthCondition, dietaryPref });
      
      const data = await mealPlannerService.generatePlan(healthCondition, dietaryPref);
      
      // Close loading alert
      closeAlert();
      
      console.log("Generated plan response:", data);
      
      // Check if weekly_plan exists and has data
      if (data.weekly_plan && data.weekly_plan.length > 0) {
        console.log("Weekly plan days:", data.weekly_plan.length);
        console.log("First day data:", data.weekly_plan[0]);
        
        setWeeklyPlan(data.weekly_plan);
        setCurrentPlanId(data.plan_id);
        setPlanCreatedAt(new Date().toISOString());
        setIsExpired(false);
        setDaysRemaining(7);
        
        localStorage.setItem(STORAGE_KEYS.CURRENT_MEAL_PLAN, JSON.stringify({
          weekly_plan: data.weekly_plan,
          plan_id: data.plan_id,
          created_at: new Date().toISOString(),
          health_condition: healthCondition,
          dietary_pref: dietaryPref
        }));
        
        // Show success message
        showSuccessAlert("Your personalized 7-day meal plan has been created successfully!");
        
        return true;
      } else {
        console.error("No weekly_plan in response:", data);
        showErrorAlert("Generated plan has no data. Please try again.");
        setError("Generated plan has no data. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Generate error:", error);
      closeAlert();
      
      // Handle different error types dynamically
      let errorMessage = "Failed to generate plan. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.status === 429) {
        errorMessage = "Too many requests. Please wait a moment and try again.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showErrorAlert(errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setGenerating(false);
    }
  };

  const regeneratePlan = async () => {
    if (selectedHealthCondition && selectedDietaryPref) {
      // Show confirmation before regenerating
      const confirmed = await showWarningAlert(
        "Regenerate Meal Plan?",
        "This will create a new meal plan based on your current preferences. Your existing plan will be replaced.",
        {
          confirmButtonText: "Yes, Regenerate",
          cancelButtonText: "Cancel",
          showCancelButton: true,
          confirmButtonColor: "#6D001A"
        }
      );
      
      if (confirmed) {
        return await generateMealPlan(selectedHealthCondition, selectedDietaryPref);
      }
      return false;
    } else {
      showErrorAlert("Please select both health condition and dietary preference to regenerate");
      setError("Please select both health condition and dietary preference to regenerate");
      return false;
    }
  };

  const deletePlan = async (planId) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token || !planId) return false;
    
    try {
      await mealPlannerService.deletePlan(planId);
      clearPlan();
      showSuccessAlert("Meal plan deleted successfully!");
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      let errorMessage = "Failed to delete plan";
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      showErrorAlert(errorMessage);
      setError(errorMessage);
      return false;
    }
  };

  const clearPlan = () => {
    setWeeklyPlan([]);
    setSelectedHealthCondition(null);
    setSelectedDietaryPref(null);
    setCurrentPlanId(null);
    setIsExpired(false);
    setDaysRemaining(0);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_MEAL_PLAN);
  };

  const selectHealthCondition = async (healthId) => {
    setSelectedHealthCondition(healthId);
    if (selectedDietaryPref) {
      await generateMealPlan(healthId, selectedDietaryPref);
    }
  };

  const selectDietaryPref = async (prefId) => {
    setSelectedDietaryPref(prefId);
    if (selectedHealthCondition) {
      await generateMealPlan(selectedHealthCondition, prefId);
    }
  };

  useEffect(() => {
    checkSavedPlan();
  }, []);

  return {
    weeklyPlan,
    generating,
    error,
    setError,
    selectedHealthCondition,
    selectedDietaryPref,
    currentPlanId,
    isExpired,
    daysRemaining,
    isLoading,
    generateMealPlan,
    regeneratePlan,
    deletePlan,
    clearPlan,
    selectHealthCondition,
    selectDietaryPref,
  };
};