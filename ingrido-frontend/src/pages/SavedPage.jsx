import React, { useState, useEffect } from "react";
import { Bookmark, Eye, Loader2, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// --- MAIN PAGE COMPONENT ---

export default function SavedPage() {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ─── Backend se Bookmarks Fetch Karna ───
  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return; // Agar login nahi hai to khali page dikhayega
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/accounts/bookmarks/",
          {
            headers: { Authorization: `Token ${token}` },
          },
        );
        setSavedRecipes(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  // ─── Bookmark Remove Karne ka Function ───
  const handleUnsave = async (recipeId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/accounts/recipes/${recipeId}/bookmark/`,
        {},
        { headers: { Authorization: `Token ${token}` } },
      );
      // UI se remove karne ke liye state update
      setSavedRecipes(savedRecipes.filter((r) => r.id !== recipeId));
    } catch (error) {
      alert("Could not remove bookmark.");
    }
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
            <h2 className="text-lg font-bold text-foreground">Saved Recipes</h2>
            <p className="text-sm text-muted-foreground">
              Total: {savedRecipes.length} Items
            </p>
          </div>
          {!localStorage.getItem("token") && (
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
            {savedRecipes.map((recipe, index) => (
              <article
                key={recipe.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {/* IMAGE */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <img
                    src={recipe.image || "/assets/placeholder.jpg"}
                    alt={recipe.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* CONTENT */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h3 className="text-md font-bold uppercase tracking-wide text-foreground">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center text-xs font-medium text-muted-foreground gap-2">
                    <span className="bg-secondary px-2 py-1 rounded">
                      {recipe.kcal} kcal
                    </span>
                    <span className="text-border">|</span>
                    <span>{recipe.prep_time} mins</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                    <span className="text-[10px] text-muted-foreground italic">
                      From {recipe.city?.name || "Global"}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Unsave Button */}
                      <button
                        onClick={() => handleUnsave(recipe.id)}
                        className="rounded-md p-2 text-primary hover:bg-primary/10 transition-colors"
                        title="Remove from saved"
                      >
                        <Bookmark className="h-5 w-5 fill-current" />
                      </button>

                      {/* View Detail Button */}
                      <button
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-secondary transition-colors"
                        title="View Recipe"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-3xl border-border">
            <Bookmark className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-lg">
              Aapne abhi tak koi recipe save nahi ki.
            </p>
            <Link
              to="/City"
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
