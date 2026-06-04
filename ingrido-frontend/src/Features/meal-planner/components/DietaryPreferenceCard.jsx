import { Salad, ChefHat, Utensils } from "lucide-react";

const iconMap = {
  Salad: Salad,
  ChefHat: ChefHat,
  Utensils: Utensils,
};

const DietaryPreferenceCard = ({ id, title, description, icon, isSelected, onClick }) => {
  const IconComponent = iconMap[icon] || Salad;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-[#b17b46] bg-[#b17b46]/10 shadow-lg"
          : "border-border bg-card hover:border-[#b17b46]/50"
      }`}
    >
      <div
        className={`p-2 rounded-full mb-2 ${
          isSelected ? "bg-[#b17b46] text-white" : "bg-secondary text-[#b17b46]"
        }`}
      >
        <IconComponent className="h-5 w-5" />
      </div>
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </button>
  );
};

export default DietaryPreferenceCard;