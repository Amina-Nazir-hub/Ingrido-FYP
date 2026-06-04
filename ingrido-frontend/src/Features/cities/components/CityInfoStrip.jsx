import { MapPin } from "lucide-react";

const CityInfoStrip = ({ filteredCount }) => {
  return (
    <div className="mb-10 flex items-center justify-between rounded-xl border border-border bg-muted/30 px-6 py-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-secondary" />
        <span className="font-bold text-lg">Top Culinary Hubs</span>
      </div>
      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
        {filteredCount} {filteredCount === 1 ? "City" : "Cities"} Found
      </span>
    </div>
  );
};

export default CityInfoStrip;