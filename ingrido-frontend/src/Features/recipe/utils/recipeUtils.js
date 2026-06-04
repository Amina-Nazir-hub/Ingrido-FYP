// recipe/utils/recipeUtils.js

export const formatIngredients = (ingredients) => {
  if (Array.isArray(ingredients)) {
    return ingredients.filter(item => item && item.trim());
  }
  if (typeof ingredients === 'string') {
    const items = ingredients.split(/,|\n/);
    return items.filter(item => item && item.trim());
  }
  return [];
};

export const formatInstructions = (instructions) => {
  if (Array.isArray(instructions)) {
    return instructions.filter(step => step && step.trim());
  }
  if (typeof instructions === 'string') {
    const steps = instructions.split(/\d+\.|\n/);
    return steps.filter(step => step && step.trim());
  }
  return [];
};

// ✅ Add this function - missing export
export const getFullImageUrl = (image, BACKEND_URL) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${BACKEND_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

// ✅ Add this function - for local history
export const saveToLocalHistory = (recipe) => {
  let history = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
  history = history.filter(item => item.title?.toLowerCase() !== recipe.title?.toLowerCase());
  history.unshift(recipe);
  history = history.slice(0, 10);
  localStorage.setItem("ingrido_history", JSON.stringify(history));
  return history;
};