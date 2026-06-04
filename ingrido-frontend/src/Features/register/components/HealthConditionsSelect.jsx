import { Heart } from "lucide-react";
import { HEALTH_OPTIONS } from "../constants";

const HealthConditionsSelect = ({ selectedConditions, onChange }) => {
  const handleToggle = (option) => {
    const updated = selectedConditions.includes(option)
      ? selectedConditions.filter(item => item !== option)
      : [...selectedConditions, option];
    onChange(updated);
  };

  return (
    <div className="space-y-4 text-left">
      <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
        <Heart className="h-4 w-4 text-secondary" /> Health Profile
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HEALTH_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-3 bg-background/30 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              checked={selectedConditions.includes(option)}
              onChange={() => handleToggle(option)}
              className="h-4 w-4 rounded border-input text-primary"
            />
            <span className="text-sm font-medium text-foreground/80">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default HealthConditionsSelect;