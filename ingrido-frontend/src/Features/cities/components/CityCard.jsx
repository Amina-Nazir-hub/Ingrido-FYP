import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL, DEFAULT_IMAGE, ROUTES } from "../constants";

const CityCard = ({ city }) => {
  const navigate = useNavigate();

  const getImageUrl = () => {
    if (!city.image) return DEFAULT_IMAGE;
    if (city.image.startsWith("http")) return city.image;
    return `${BACKEND_URL}${city.image}`;
  };

  const handleExplore = () => {
    navigate(ROUTES.CITY_DISHES(city.name));
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={getImageUrl()}
          alt={city.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = DEFAULT_IMAGE;
          }}
        />
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-border text-black">
            {city.region}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl font-bold font-display group-hover:text-primary transition-colors">
          {city.name}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Discover authentic recipes and traditional dishes from{" "}
          <span className="text-secondary font-bold">
            {city.name}, {city.region}
          </span>
          .
        </p>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 flex items-center justify-between border-t border-border">
          <span className="text-xs text-muted-foreground italic">
            {city.dishes_count || 0} Dishes Available
          </span>

          <button
            onClick={handleExplore}
            className="flex items-center gap-2 bg-[#b17b46] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
          >
            <Eye size={14} /> Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default CityCard;