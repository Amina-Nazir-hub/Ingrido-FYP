// utils/recipeUtils.js

/**
 * Formats instructions string or array into a clean array of steps.
 * Handles Python-style list strings, numbered lists, and standard paragraphs.
 * @param {string|string[]} instructions 
 * @returns {string[]}
 */
export const formatInstructions = (instructions) => {
  if (!instructions) return [];
  
  let cleanInstructions = instructions;

  // 1. Agar backend se Python list string shuru ho rahi hai like "['Step 1', 'Step 2']"
  if (typeof cleanInstructions === 'string' && cleanInstructions.trim().startsWith('[')) {
    try {
      // Single quotes ko double quotes se badlein taake valid JSON ban jaye
      const validJsonString = cleanInstructions.replace(/'/g, '"');
      const parsed = JSON.parse(validJsonString);
      if (Array.isArray(parsed)) {
        return parsed.filter(step => step && step.trim());
      }
    } catch (e) {
      // Agar JSON parse fail ho jaye toh brackets clean kar dein
      cleanInstructions = cleanInstructions.replace(/[\[\]']/g, '');
    }
  }

  if (Array.isArray(cleanInstructions)) {
    return cleanInstructions.filter(step => step && step.trim());
  }
  
  if (typeof cleanInstructions === 'string') {
    const numberedMatch = cleanInstructions.match(/\d+[\.\)\-]\s/g);
    
    if (numberedMatch) {
      const steps = cleanInstructions.split(/\d+[\.\)\-]\s/);
      return steps.filter(step => step && step.trim());
    } else {
      const steps = cleanInstructions.split(/[\n\r]+|\.\s*/);
      return steps.filter(step => step && step.trim());
    }
  }
  
  return [];
};

/**
 * Formats ingredients string or array into a clean array.
 * Handles Python-style list strings and comma-separated text safely.
 * @param {string|string[]} ingredients 
 * @returns {string[]}
 */
export const formatIngredients = (ingredients) => {
  if (!ingredients) return [];
  
  let cleanIngredients = ingredients;

  // 1. Agar backend se Python list string shuru ho rahi hai like "['2 cups rice', 'sugar']"
  if (typeof cleanIngredients === 'string' && cleanIngredients.trim().startsWith('[')) {
    try {
      // Single quotes ko double quotes se badlein taake valid JSON ban jaye
      const validJsonString = cleanIngredients.replace(/'/g, '"');
      const parsed = JSON.parse(validJsonString);
      if (Array.isArray(parsed)) {
        return parsed.filter(item => item && item.trim());
      }
    } catch (e) {
      // Fallback: Agar kisi wajah se parse fail ho toh square brackets aur quotes saaf karein
      cleanIngredients = cleanIngredients.replace(/[\[\]']/g, '');
    }
  }

  if (Array.isArray(cleanIngredients)) {
    return cleanIngredients.filter(item => item && item.trim());
  }
  
  if (typeof cleanIngredients === 'string') {
    // Purana smart split logic jo normal text strings ke liye perfect chal raha tha
    const items = cleanIngredients.split(/[\n\r]+|,\s*(?=\d|\d+\/\d|[A-Z])/);
    return items.filter(item => item && item.trim());
  }
  
  return [];
};

/**
 * Generates full image URL handling both external (http) and relative paths.
 * @param {string} image 
 * @param {string} BACKEND_URL 
 * @returns {string|null}
 */
export const getFullImageUrl = (image, BACKEND_URL) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${BACKEND_URL}${image.startsWith('/') ? '' : '/'}${image}`;
};

/**
 * Saves a recipe to local storage history, avoiding duplicates and keeping last 10.
 * @param {Object} recipe 
 * @returns {Object[]} Updated history array
 */
export const saveToLocalHistory = (recipe) => {
  let history = JSON.parse(localStorage.getItem("ingrido_history") || "[]");
  
  history = history.filter(item => item.title?.toLowerCase() !== recipe.title?.toLowerCase());
  history.unshift(recipe);
  history = history.slice(0, 10);
  
  localStorage.setItem("ingrido_history", JSON.stringify(history));
  return history;
};