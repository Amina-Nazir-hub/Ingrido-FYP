import { ChevronLeft } from "lucide-react";

export const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-sm font-bold text-primary hover:text-secondary transition-colors group"
  >
    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
    Back to Dashboard
  </button>
);