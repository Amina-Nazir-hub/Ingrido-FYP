import { Mail } from "lucide-react";
import { BackButton } from "./BackButton";

export const ProfileHeader = ({ email, onBack }) => (
  <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
    <BackButton onClick={onBack} />
    <p className="text-muted-foreground text-sm flex items-center gap-1">
      <Mail className="w-3 h-3" /> {email}
    </p>
  </div>
);