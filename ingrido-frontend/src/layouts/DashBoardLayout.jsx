import { Send, ExternalLink, History } from "lucide-react";

//  WelcomeHero
export function WelcomeHero({ name }) {
  return (
    <section className="flex flex-col items-center justify-center w-full py-12 pt-20">
      <div className="w-full max-w-3xl text-center mb-10">
        <h2 className="text-2xl text-muted-foreground mb-3 font-sans">
          Hello, {name}!
        </h2>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight font-display">
          Ready to discover delicious meals today?
        </h1>
      </div>

      <div className="w-full max-w-3xl bg-card rounded-[32px] shadow-card border border-border p-2 transition-all focus-within:shadow-card-hover focus-within:border-secondary/50">
        <div className="flex items-center px-4 py-1">
          <input
            type="text"
            placeholder="Find a 15-minute dinner recipe..."
            className="w-full text-lg md:text-xl outline-none placeholder-muted-foreground text-foreground bg-transparent py-3"
          />
          <button 
            type="submit"
            className="flex items-center justify-center bg-primary hover:bg-secondary text-primary-foreground p-3 rounded-full transition-all active:scale-95 shadow-sm"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

// RecentlyViewed 
const RECENT_RECIPES = [
  { id: 1, meal: "Grilled Chicken Salad", desc: "Light and protein-rich", time: "2 hours ago" },
  { id: 2, meal: "Vegetable Stir Fry", desc: "Seasonal vegetables", time: "Yesterday" },
  { id: 3, meal: "Creamy Pasta", desc: "Italian classic", time: "2 days ago" },
];

export function RecentlyViewed() {
  return (
    <section className="py-12  border-border/40">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-lg">
            <History className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold font-display">Recently Viewed</h2>
        </div>
        <button className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
          Clear History
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {RECENT_RECIPES.map((recipe) => (
          <div 
            key={recipe.id} 
            className="group bg-card text-card-foreground rounded-3xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
          >
            <div className="p-5">
              <h3 className="text-lg font-bold mb-1 transition-colors font-display">
                {recipe.meal}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-1">{recipe.desc}</p>
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground italic">{recipe.time}</span>
                <a href="#" className="text-sm font-semibold text-primary flex items-center gap-1 hover:text-secondary transition-all">
                  View <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}