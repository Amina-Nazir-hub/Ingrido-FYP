import { Flame, Clock, Drumstick, Bookmark, Eye } from "lucide-react";
import { BACKEND_URL, DEFAULT_IMAGE } from "../constants";

const RecipeCard = ({
  id,
  title,
  image,
  kcal,
  prep_time,
  dietary_type,
  is_saved,
  is_ai_generated,
  onBookmark,
  onViewDetail,
}) => {
  const getFullImageUrl = () => {
    if (!image) return DEFAULT_IMAGE;
    if (image.startsWith('http')) return image;
    return `${BACKEND_URL}${image.startsWith('/') ? '' : '/'}${image}`;
  };

  const imageUrl = getFullImageUrl();
  const isAI = is_ai_generated || (id && id.toString().startsWith("ai-"));

  return (
    <article className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE;
          }}
        />
      </div>

      <div className="space-y-3 p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-foreground leading-tight">{title}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
            dietary_type === 'veg' 
              ? 'border-green-500 text-green-500' 
              : 'border-red-500 text-red-500'
          }`}>
            {dietary_type === 'veg' ? 'VEG' : 'NON-VEG'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center rounded-md bg-secondary/50 p-2">
            <Flame className="mb-1 h-4 w-4 text-[#b17b46]" />
            <span className="font-semibold text-foreground">{kcal || '0'}</span>
            <span className="text-muted-foreground uppercase text-[9px]">kcal</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary/50 p-2">
            <Clock className="mb-1 h-4 w-4 text-[#b17b46]" />
            <span className="font-semibold text-foreground">{prep_time || '0'}</span>
            <span className="text-muted-foreground uppercase text-[9px]">mins</span>
          </div>

          <div className="flex flex-col items-center rounded-md bg-secondary/50 p-2 text-center">
            <Drumstick className="mb-1 h-4 w-4 text-[#b17b46]" />
            <span className="font-semibold text-foreground leading-none">15g</span>
            <span className="text-muted-foreground uppercase text-[9px]">protein</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1 border-t border-border pt-3">
          <button
            onClick={() => onBookmark(id)}
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
            onClick={() => {
              console.log("Eye clicked:", { id, title, isAI });
              onViewDetail(id, title, isAI);
            }}
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

export default RecipeCard;