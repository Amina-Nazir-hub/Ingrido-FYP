import { useState, useEffect } from "react";
import { mealPlannerService } from "../services/mealPlannerService";
import { STORAGE_KEYS } from "../constants";

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

  // In useMealPlan.js, update the generateMealPlan function:

const generateMealPlan = async (healthCondition, dietaryPref) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    setError("Please login to generate meal plans");
    return false;
  }

  if (!healthCondition || !dietaryPref) {
    setError("Please select both health condition and dietary preference");
    return false;
  }

  try {
    setGenerating(true);
    setError(null);
    
    console.log("Generating plan with:", { healthCondition, dietaryPref });
    
    const data = await mealPlannerService.generatePlan(healthCondition, dietaryPref);
    
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
      
      return true;
    } else {
      console.error("No weekly_plan in response:", data);
      setError("Generated plan has no data. Please try again.");
      return false;
    }
  } catch (error) {
    console.error("Generate error:", error);
    setError(error.response?.data?.error || "Failed to generate plan. Please try again.");
    return false;
  } finally {
    setGenerating(false);
  }
};

  const regeneratePlan = async () => {
    if (selectedHealthCondition && selectedDietaryPref) {
      return await generateMealPlan(selectedHealthCondition, selectedDietaryPref);
    } else {
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
      return true;
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete plan");
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

  const selectHealthCondition = (healthId) => {
    setSelectedHealthCondition(healthId);
    if (selectedDietaryPref) {
      generateMealPlan(healthId, selectedDietaryPref);
    }
  };

  const selectDietaryPref = (prefId) => {
    setSelectedDietaryPref(prefId);
    if (selectedHealthCondition) {
      generateMealPlan(selectedHealthCondition, prefId);
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