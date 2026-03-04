import { WelcomeHero, RecentlyViewed } from "../layouts/DashBoardLayout";

export function Dashboard() {
  return (
    <div className="min-h-screen pb-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHero name="Amina" />
        <RecentlyViewed />
      </div>
    </div>
  );
}