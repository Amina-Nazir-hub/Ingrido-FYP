import { formatInstructions } from "../utils/recipeUtils";

const DirectionsList = ({ instructions }) => {
  const steps = formatInstructions(instructions);
  
  return (
    <div className="p-6 md:p-10 bg-secondary/5">
      <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-8 bg-primary rounded-full"></span> Directions
      </h2>
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 pb-4 last:pb-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm">
              {i + 1}
            </span>
            <p className="text-foreground/80 leading-relaxed pt-1">{step.trim()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectionsList;