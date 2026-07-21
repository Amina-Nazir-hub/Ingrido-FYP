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
    // Try splitting on newlines first (AI returns newline-separated steps)
    let steps = cleanInstructions.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean);
    
    // If only one step resulted, try numbered list pattern
    if (steps.length <= 1) {
      const numberedMatch = cleanInstructions.match(/\d+[\.\)\-]\s/g);
      if (numberedMatch) {
        steps = cleanInstructions.split(/\d+[\.\)\-]\s/).filter(step => step && step.trim());
      } else {
        // Split on sentence boundaries as last resort
        steps = cleanInstructions.split(/(?<=\.)\s+(?=[A-Z])/).filter(step => step && step.trim());
      }
    }
    
    // Clean each step: strip leading numbers/bullets
    return steps.map(step => step.replace(/^[\d\.\)\-\*•\s]+/, '').trim()).filter(Boolean);
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
    // AI recipes return newline-separated ingredients; DB recipes may use commas.
    let items = cleanIngredients.split(/[\r\n]+/).map(s => s.trim()).filter(Boolean);
    
    // If newlines didn't produce multiple items, split on commas.
    if (items.length <= 1) {
      items = cleanIngredients.split(/,\s*/).map(s => s.trim()).filter(Boolean);
    }
    
    // Clean leading bullets/numbers
    return items.map(item => item.replace(/^[\d\.\)\-\*•\s]+/, '').trim()).filter(Boolean);
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