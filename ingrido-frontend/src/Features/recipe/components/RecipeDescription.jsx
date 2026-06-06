const RecipeDescription = ({ recipe, displayTitle }) => {
  return (
    <div className="rounded-2xl border bg-card p-10">
      <h2 className="mb-3 font-serif text-xl font-bold">About this dish</h2>
      <p className="text-muted-foreground leading-relaxed">
        {recipe.description ||
          `Experience the authentic taste of ${displayTitle}.`}
      </p>
    </div>
  );
};

export default RecipeDescription;
