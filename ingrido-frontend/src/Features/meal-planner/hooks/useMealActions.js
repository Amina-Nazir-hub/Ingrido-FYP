import { useNavigate } from "react-router-dom";
import { 
  showConfirmDialog, 
  showErrorAlert, 
  showInfoAlert,
  showWarningAlert,
  showSuccessAlert 
} from "../../shared/utils/alertUtils";

export const useMealActions = () => {
  const navigate = useNavigate();

  const handleRecipeTitleClick = (meal) => {
    if (!meal || !meal.title) {
      showErrorAlert("No meal title provided");
      return;
    }
    const encodedTitle = encodeURIComponent(meal.title);
    navigate(`/recipe?title=${encodedTitle}`);
  };

  const handleViewVideo = (url) => {
    if (url) {
      window.open(url, "_blank");
    } else {
      showInfoAlert("Video Coming Soon", "Video tutorial will be available soon for this recipe!");
    }
  };

  const handleOrderPandamart = (title) => {
    window.open(`https://www.foodpanda.pk/brand/pandamart?q=${encodeURIComponent(title)}`, "_blank");
  };

  const handleClearAndStartOver = async (clearPlan) => {
    const confirmed = await showConfirmDialog(
      "Clear Meal Plan?",
      "Are you sure you want to clear this plan? This action cannot be undone.",
      {
        confirmButtonText: "Yes, Clear Plan",
        cancelButtonText: "Cancel"
      }
    );
    
    if (confirmed) {
      clearPlan();
      showSuccessAlert("Meal plan cleared successfully!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeletePlan = async (deletePlan, currentPlanId) => {
    if (!currentPlanId) {
      showErrorAlert("No plan found to delete");
      return;
    }
    
    const confirmed = await showConfirmDialog(
      "Delete Meal Plan?",
      "Are you sure you want to delete this plan? This action cannot be undone.",
      {
        confirmButtonText: "Yes, Delete Plan",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#d33"
      }
    );
    
    if (confirmed) {
      const success = await deletePlan(currentPlanId);
      if (success) {
        showSuccessAlert("Meal plan deleted successfully!");
      } else {
        showErrorAlert("Failed to delete plan. Please try again.");
      }
    }
  };

  const handleRegenerateConfirm = async (regeneratePlan) => {
    const confirmed = await showConfirmDialog(
      "Regenerate Meal Plan?",
      "This will create a new meal plan based on your current preferences. Your existing plan will be replaced.",
      {
        confirmButtonText: "Yes, Regenerate",
        cancelButtonText: "Cancel"
      }
    );
    
    if (confirmed) {
      return await regeneratePlan();
    }
    return false;
  };

  const handlePlanExpired = (clearPlan) => {
    showWarningAlert(
      "Plan Expired",
      "Your meal plan has expired after 7 days. Please create a new plan to continue.",
      {
        confirmButtonText: "Create New Plan"
      }
    ).then(() => {
      clearPlan();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return {
    handleRecipeTitleClick,
    handleViewVideo,
    handleOrderPandamart,
    handleClearAndStartOver,
    handleDeletePlan,
    handleRegenerateConfirm,
    handlePlanExpired,
  };
};