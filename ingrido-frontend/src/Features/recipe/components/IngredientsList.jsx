import { formatIngredients } from "../utils/recipeUtils";

const IngredientsList = ({ ingredients }) => {
  const ingredientsList = formatIngredients(ingredients);

  return (
    // border-border/80 ko badal kar border-primary kiya hai taake center border burgundy color ka ho jaye
    <div className="p-6 md:p-6 md:pr-10 border-b md:border-b-0 md:border-r border-primary h-full-4">
      <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-8 bg-primary rounded-full"></span> Ingredients
      </h2>
      <ul className="space-y-4">
        {ingredientsList.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 text-foreground/80 pb-2 last:pb-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0"></span>
            {item.trim()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList;
