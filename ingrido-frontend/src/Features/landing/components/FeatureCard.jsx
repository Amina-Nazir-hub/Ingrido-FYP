import { Utensils, Leaf, MapPin, CalendarDays } from "lucide-react";

const iconMap = {
  Utensils: Utensils,
  Leaf: Leaf,
  MapPin: MapPin,
  CalendarDays: CalendarDays
};

export const FeatureCard = ({ icon, title, description }) => {
  const IconComponent = iconMap[icon];
  
  return (
    <div className="bg-card border-2 border-primary rounded-lg p-6 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-up">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        <IconComponent className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
};