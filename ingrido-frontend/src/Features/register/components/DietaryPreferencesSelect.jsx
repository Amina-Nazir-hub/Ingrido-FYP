import { Salad } from "lucide-react";
import { DIET_OPTIONS } from "../constants";

const DietaryPreferencesSelect = ({ selectedPreferences, onChange }) => {
  const handleToggle = (option) => {
    const updated = selectedPreferences.includes(option)
      ? selectedPreferences.filter(item => item !== option)
      : [...selectedPreferences, option];
    onChange(updated);
  };

  return (
    <div className="space-y-4 text-left">
      <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
        <Salad className="h-4 w-4 text-secondary" /> Dietary Preferences
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DIET_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center space-x-3 bg-background/30 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-all"
          >
            <input
              type="checkbox"
              checked={selectedPreferences.includes(option)}
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

export default DietaryPreferencesSelect;