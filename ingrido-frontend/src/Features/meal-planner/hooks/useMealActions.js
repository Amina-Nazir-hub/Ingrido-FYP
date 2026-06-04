import { useNavigate } from "react-router-dom";

export const useMealActions = () => {
  const navigate = useNavigate();

  const handleRecipeTitleClick = (meal) => {
    if (!meal || !meal.title) {
      console.error("No meal title provided");
      return;
    }
    const encodedTitle = encodeURIComponent(meal.title);
    navigate(`/recipe?title=${encodedTitle}`);
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

  const handleClearAndStartOver = (clearPlan) => {
    if (window.confirm("Are you sure you want to clear this plan? This action cannot be undone.")) {
      clearPlan();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeletePlan = async (deletePlan, currentPlanId) => {
    if (!currentPlanId) return;
    if (window.confirm("Are you sure you want to delete this plan? This action cannot be undone.")) {
      await deletePlan(currentPlanId);
    }
  };

  return {
    handleRecipeTitleClick,
    handleViewVideo,
    handleOrderPandamart,
    handleClearAndStartOver,
    handleDeletePlan,
  };
};