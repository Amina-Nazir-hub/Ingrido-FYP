import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Clock, Bookmark, Eye, Drumstick } from "lucide-react";
import { useBookmark } from "../../../context/BookmarkContext";

const BACKEND_BASE = "http://127.0.0.1:8000";
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";

const DashboardRecipeCard = ({
  id,
  title,
  meal,
  image,
  kcal,
  prep_time,
  protein,
  is_saved = false,
  is_ai_generated = false,
  onBookmarkToggle,
  forceAI,
}) => {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark, refreshBookmarks } = useBookmark();
  
  // Determine if this is AI recipe
  const displayTitle = title || meal || "Tasty Recipe";
  const isAI = forceAI !== undefined ? forceAI : is_ai_generated;
  
  // ✅ Check bookmark status from context
  const [localSaved, setLocalSaved] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Sync bookmark status from context
  useEffect(() => {
    const identifier = isAI ? displayTitle : id;
    const bookmarked = isBookmarked(identifier, displayTitle, isAI);
    console.log(`📌 Bookmark status for ${displayTitle}: ${bookmarked}`);
    setLocalSaved(bookmarked);
  }, [id, displayTitle, isAI, isBookmarked]);

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE}${image}`
    : DEFAULT_IMAGE;

  const handleViewDetail = () => {
    if (is_ai_generated || (id && id.toString().startsWith("ai-")) || (id && id.toString().includes("seasonal"))) {
      navigate(`/recipe/ai/${encodeURIComponent(displayTitle)}`);
    } else {
      navigate(`/recipe/${id}`);
    }
  };

  // ✅ Handle bookmark click - instant update
  const handleBookmark = async (e) => {
    e.stopPropagation();
    
    if (isProcessing) return;
    
    const token = localStorage.getItem("ingrido_token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    // ✅ INSTANT UI UPDATE (optimistic)
    const newState = !localSaved;
    console.log(`📌 Toggling bookmark for ${displayTitle}: ${localSaved} -> ${newState}`);
    setLocalSaved(newState);
    setIsProcessing(true);
    
    try {
      // Call toggleBookmark from context
      const result = await toggleBookmark(id, displayTitle, isAI, {
        title: displayTitle,
        image: image,
        kcal: kcal,
        prep_time: prep_time,
      });
      
      console.log(`✅ Bookmark result for ${displayTitle}:`, result);
      
      // Refresh bookmarks to keep context in sync
      await refreshBookmarks();
      
      // Notify parent if needed
      if (onBookmarkToggle) {
        onBookmarkToggle(id, displayTitle, isAI, newState);
      }
    } catch (err) {
      console.error("Bookmark error:", err);
      // ❌ Revert on error
      setLocalSaved(!newState);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg relative">
      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={displayTitle}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-bold text-foreground line-clamp-1">
          {displayTitle}
        </h3>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Flame className="mb-1 h-4 w-4 text-orange-500" />
            <span className="font-semibold text-foreground">
              {kcal || "350"}
            </span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Clock className="mb-1 h-4 w-4 text-blue-500" />
            <span className="font-semibold text-foreground">
              {prep_time || "25"}
            </span>
            <span className="text-muted-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Drumstick className="mb-1 h-4 w-4 text-green-600" />
            <span className="font-semibold text-foreground">
              {protein || "20g"}
            </span>
            <span className="text-muted-foreground">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={handleBookmark}
            disabled={isProcessing}
            className={`rounded-md p-2 transition ${
              isProcessing ? "opacity-50 cursor-wait" : ""
            } ${
              localSaved
                ? "text-amber-600 bg-amber-50"
                : "text-muted-foreground hover:bg-secondary hover:text-amber-600"
            }`}
            title={localSaved ? "Remove from saved" : "Save Recipe"}
          >
            <Bookmark className={`h-5 w-5 ${localSaved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={handleViewDetail}
            className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition"
            title="View Details"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default DashboardRecipeCard;