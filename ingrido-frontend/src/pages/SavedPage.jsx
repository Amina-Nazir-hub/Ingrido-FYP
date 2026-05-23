import React, { useState, useEffect } from "react";
import { Bookmark, Eye, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// --- MAIN PAGE COMPONENT ---

export default function SavedPage() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = "http://127.0.0.1:8000";

  // ─── Backend se Bookmarks Fetch Karna ───
  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem("ingrido_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/accounts/saved/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        const actualData = Array.isArray(response.data)
          ? response.data
          : response.data.results || response.data.bookmarks || [];

        setSavedRecipes(actualData);
        
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // ─── Bookmark Remove Karne ka Function ───
  const handleUnsave = async (recipeId) => {
    const token = localStorage.getItem("ingrido_token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setRemovingId(recipeId);

      const response = await axios.post(
        `${BACKEND_URL}/api/accounts/recipes/${recipeId}/bookmark/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "removed") {
        setSavedRecipes((prev) =>
          prev.filter((r) => (r.recipe_id || r.id) !== recipeId)
        );
      }
    } catch (error) {
      console.error("Could not remove bookmark:", error);
      alert("Could not remove bookmark.");
    } finally {
      setRemovingId(null);
    }
  };

  // Function to get proper image URL
  const getImageUrl = (recipe) => {
    let image = recipe.image || recipe.recipe_details?.image;
    
    // If image exists
    if (image) {
      // If it's a full URL
      if (image.startsWith('http')) {
        return image;
      }
      // If it's a local path
      return `${BACKEND_URL}${image}`;
    }
    
    // Return placeholder if no image
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="mt-20 border-b border-border bg-secondary/10 animate-fade-in">
        <div className="mx-auto px-6 py-14 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl font-display">
            Your Saved <span className="text-primary">Collection</span>
          </h1>
          <p className="mt-3 text-base text-muted-foreground md:text-lg font-sans">
            Quick access to your curated culinary library.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <main className="mx-auto max-w-7xl px-6 py-10 font-sans">
        <header className="mb-8 rounded-xl border border-border bg-muted/50 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Saved Recipes
            </h2>
            <p className="text-sm text-muted-foreground">
              Total: {savedRecipes.length} Items
            </p>
          </div>

          {!localStorage.getItem("ingrido_token") && (
            <Link
              to="/login"
              className="text-primary font-bold text-sm underline"
            >
              Login to see your saves
            </Link>
          )}
        </header>

        {savedRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {savedRecipes.map((recipe) => {
              const recipeId = recipe.recipe_id || recipe.id;
              const recipeTitle = recipe.title || recipe.recipe_details?.title;
              const imageUrl = getImageUrl(recipe);
              
              const calories = recipe.calories || recipe.kcal || recipe.recipe_details?.kcal || "---";
              const prepTime = recipe.prep_time || recipe.recipe_details?.prep_time || 30;
              const dietaryType = recipe.dietary_type || recipe.recipe_details?.dietary_type;

              return (
                <article
                  key={recipe.id || recipe.bookmark_id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={recipeTitle}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = `https://placehold.co/800x500/3f3f46/ffffff?text=${encodeURIComponent(recipeTitle || 'Recipe')}`;
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="text-4xl mb-2">🍽️</div>
                        <p className="text-xs text-muted-foreground">No image available</p>
                      </div>
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="text-md font-bold uppercase tracking-wide text-foreground line-clamp-1">
                      {recipeTitle}
                    </h3>

                    <div className="flex items-center text-xs font-medium text-muted-foreground gap-2 flex-wrap">
                      <span className="bg-secondary px-2 py-1 rounded">
                        {calories} kcal
                      </span>
                      <span className="text-border">|</span>
                      <span>{prepTime} mins</span>
                      {dietaryType && (
                        <>
                          <span className="text-border">|</span>
                          <span className={`px-2 py-1 rounded text-[10px] ${
                            dietaryType === 'veg' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {dietaryType === 'veg' ? 'VEG' : 'NON-VEG'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                      <span className="text-[10px] text-muted-foreground italic">
                        {recipe.category || "Saved Recipe"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUnsave(recipeId)}
                          disabled={removingId === recipeId}
                          className="rounded-md p-2 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                          title="Remove from saved"
                        >
                          {removingId === recipeId ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Bookmark className="h-5 w-5 fill-current" />
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/recipe/${recipeId}`)}
                          className="rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors"
                          title="View Recipe"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg">
              Aapne abhi tak koi recipe save nahi ki.
            </p>
            <Link
              to="/city"
              className="mt-4 inline-block text-primary font-bold hover:underline"
            >
              Explore Cities & Save Recipes
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}