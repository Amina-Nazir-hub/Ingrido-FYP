import { Menu, X } from "lucide-react";

export const MobileMenuButton = ({ isOpen, onToggle }) => {
  return (
    <button onClick={onToggle} className="md:hidden p-2 text-foreground">
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
};