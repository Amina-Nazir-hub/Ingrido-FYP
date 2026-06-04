import { Flame, Clock, Drumstick, Bookmark, Eye, Sparkles } from "lucide-react";
import { BACKEND_BASE, DEFAULT_IMAGE } from "../constants";

const SearchResultCard = ({
  id,
  title,
  meal,
  image,
  kcal,
  prep_time,
  protein,
  is_saved,
  is_ai_generated,
  onBookmark,
  onViewDetail,
}) => {
  const displayTitle = title || meal || "Tasty Recipe";
  const isAI = is_ai_generated || (id && id.toString().startsWith("ai-"));

  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${BACKEND_BASE}${image}`
    : DEFAULT_IMAGE;

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg relative">
      {isAI && (
        <div className="absolute top-3 left-3 z-10 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
          <Sparkles size={10} /> AI Generated
        </div>
      )}

      <div className="aspect-video w-full overflow-hidden bg-muted relative">
        <img
          src={imageUrl}
          alt={displayTitle}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-lg font-bold text-foreground line-clamp-1">{displayTitle}</h3>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Flame className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{kcal || "350"}</span>
            <span className="text-muted-foreground">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Clock className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{prep_time || "25"}</span>
            <span className="text-muted-foreground">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary p-2">
            <Drumstick className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{protein || "20g"}</span>
            <span className="text-muted-foreground">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={() => onBookmark(id, displayTitle, isAI)}
            className={`rounded-md p-2 transition ${
              is_saved
                ? "text-[#b17b46] bg-[#b17b46]/10"
                : "text-muted-foreground hover:bg-secondary hover:text-[#b17b46]"
            }`}
            title={is_saved ? "Remove from saved" : "Save Recipe"}
          >
            <Bookmark className={`h-5 w-5 ${is_saved ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => onViewDetail(id, displayTitle, isAI)}
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

export default SearchResultCard;