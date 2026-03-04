import { Youtube ,ShoppingCart} from "lucide-react";

const MealCard = ({ meal }) => {
  const badgeStyles = {
    summer: "bg-season-summer/20 text-foreground",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/20 text-foreground"
  };

  return (
    <div className="p-5">
      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3 ${badgeStyles[meal.variant]}`}>
        {meal.type}
      </div>
      <h3 className="font-display font-semibold mb-1">{meal.title}</h3>
      <p className="text-sm text-muted-foreground mb-3">{meal.desc}</p>
      <div className="flex gap-3">
        <a href={meal.videoUrl} target="_blank" className="flex items-center gap-1 text-xs font-medium text-destructive hover:underline">
          <Youtube /> Video
        </a>
        <a href={meal.shopUrl} target="_blank" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          <ShoppingCart /> Pandamart
        </a>
      </div>
    </div>
  );
};

export default MealCard;