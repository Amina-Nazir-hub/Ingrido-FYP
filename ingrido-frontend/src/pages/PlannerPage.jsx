import { Calendar, Info, RefreshCw } from "lucide-react";
import { WEEKLY_PLAN } from '../utils/MealData';
import { DaySchedule } from '../components/DaySchedule';
import { Link } from "react-router-dom";

// UI Components
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "../userinterface/Breadcrumbs";
import { Alert, AlertTitle, AlertDescription } from "../userinterface/Alert";

export function PlannerPage() {
  
  const handleRegenerate = () => {
    // Yahan future mein AI logic ya refresh function aayega
    console.log("Regenerating meal plan...");
    alert("Creating a fresh meal plan for you!");
  };

  return (
    <div className="pt-28 pb-16 container mx-auto px-4 max-w-5xl">
      
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Meal Planner</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
               <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Weekly Meal Plan
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your personalized 7-day meal schedule based on your preferences.
          </p>
        </div>

        {/* REGENERATE BUTTON: Badges ki jagah ab ye hai */}
        <button 
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 hover:bg-secondary transition-all active:scale-95 group"
        >
          <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
          Regenerate Plan
        </button>
      </div>

      {/* Alert Section */}
      <Alert className="mb-10 bg-primary/5 border-primary/20">
        <Info className="h-4 w-4" />
        <AlertTitle>Chef's Tip!</AlertTitle>
        <AlertDescription>
          Not feeling these recipes? Click the <b>Regenerate</b> button to get a brand new set of meals for the week.
        </AlertDescription>
      </Alert>

      {/* Days List */}
      <div className="space-y-10">
        {WEEKLY_PLAN.map((day) => (
          <DaySchedule key={day.day} dayData={day} />
        ))}
      </div>
    </div>
  );
}