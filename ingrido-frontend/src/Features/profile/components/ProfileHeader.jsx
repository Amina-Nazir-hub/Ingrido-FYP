import { Mail } from "lucide-react";
import ProfileAvatar from "./ProfileAvatar";

export const ProfileHeader = ({ firstName, email, initial }) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <ProfileAvatar initial={initial} />
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        {firstName || "User"}
      </h2>
      <p className="text-muted-foreground text-sm flex items-center gap-1">
        <Mail className="w-3 h-3" /> {email}
      </p>
    </div>
  );
};
