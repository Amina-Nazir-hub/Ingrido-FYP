import Select from "react-select";
import { User, Heart, Salad, Save } from "lucide-react";
import { HEALTH_OPTIONS, DIET_OPTIONS } from "../constants";

export const ProfileForm = ({ profile, onFieldChange, onSave, isSaving }) => {
  const handleHealthChange = (selected) => {
    onFieldChange("health_conditions", selected || []);
  };

  const handleDietChange = (selected) => {
    onFieldChange("dietary_preferences", selected || []);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Full Name
        </label>
        <input
          className="w-full p-4 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
          value={profile.first_name}
          onChange={(e) => onFieldChange("first_name", e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" /> Health Conditions
        </label>
        <Select
          isMulti
          options={HEALTH_OPTIONS}
          value={profile.health_conditions}
          onChange={handleHealthChange}
          placeholder="Select health conditions..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <Salad className="w-4 h-4 text-green-500" /> Dietary Preferences
        </label>
        <Select
          isMulti
          options={DIET_OPTIONS}
          value={profile.dietary_preferences}
          onChange={handleDietChange}
          placeholder="Select dietary preferences..."
        />
      </div>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-5 h-5" /> 
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};