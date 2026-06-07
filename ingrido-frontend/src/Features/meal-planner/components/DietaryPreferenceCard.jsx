// meal-planner/components/DietaryPreferenceCard.jsx
import { Salad, ChefHat, Utensils } from "lucide-react";

const iconMap = {
  Salad: Salad,
  ChefHat: ChefHat,
  Utensils: Utensils,
};

const DietaryPreferenceCard = ({
  id,
  title,
  description,
  icon,
  isSelected,
  onClick,
}) => {
  const IconComponent = iconMap[icon] || Salad;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-primary bg-primary/10 shadow-lg"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {/* Icon background is locked to burgundy (bg-primary) and icon color to white (text-primary-foreground) */}
      <div className="p-2 rounded-full mb-2 bg-primary text-primary-foreground">
        <IconComponent className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      {description && (
        <p className="text-xs text-foreground mt-1">{description}</p>
      )}
    </button>
  );
};

export default DietaryPreferenceCard;
