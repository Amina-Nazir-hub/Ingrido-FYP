import { Search } from "lucide-react";

const CitySearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="mb-12 flex justify-center">
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          className="h-14 w-full rounded-full border border-border bg-primary-foreground pl-12 pr-6 focus:ring-2 focus:ring-primary outline-none transition-all"
          placeholder="Search by city or province..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default CitySearchBar;
