import HealthConditionCard from "./HealthConditionCard";
import DietaryPreferenceCard from "./DietaryPreferenceCard";
import { HEALTH_OPTIONS, DIETARY_OPTIONS } from "../constants";

const PreferencesSection = ({ 
  selectedHealthCondition, 
  selectedDietaryPref, 
  onHealthSelect, 
  onDietarySelect 
}) => {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-bold text-center mb-8">Choose Your Preferences</h2>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-center mb-4">Health Condition</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HEALTH_OPTIONS.map((option) => (
            <HealthConditionCard 
              key={option.id} 
              {...option} 
              isSelected={selectedHealthCondition === option.id} 
              onClick={() => onHealthSelect(option.id)} 
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-center mb-4">Dietary Preference</h3>
        <div className="flex justify-center gap-6 flex-wrap">
          {DIETARY_OPTIONS.map((option) => (
            <DietaryPreferenceCard 
              key={option.id} 
              {...option} 
              isSelected={selectedDietaryPref === option.id} 
              onClick={() => onDietarySelect(option.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;