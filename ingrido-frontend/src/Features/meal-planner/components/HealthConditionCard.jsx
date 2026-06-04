import { Droplet, Activity, Heart, Apple } from "lucide-react";

const iconMap = {
  Droplet: Droplet,
  Activity: Activity,
  Heart: Heart,
  Apple: Apple,
};

const HealthConditionCard = ({ id, title, description, icon, isSelected, isRecommended, onClick }) => {
  const IconComponent = iconMap[icon] || Droplet;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center text-center p-6 rounded-xl border-2 transition-all relative ${
        isSelected
          ? "border-[#b17b46] bg-[#b17b46]/10 shadow-lg"
          : "border-border bg-card hover:border-[#b17b46]/50"
      } ${isRecommended ? "ring-2 ring-green-500" : ""}`}
    >
      {isRecommended && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Recommended
        </span>
      )}
      <div
        className={`p-3 rounded-full mb-3 ${
          isSelected ? "bg-[#b17b46] text-white" : "bg-secondary text-[#b17b46]"
        }`}
      >
        <IconComponent className="h-6 w-6" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
};

export default HealthConditionCard;