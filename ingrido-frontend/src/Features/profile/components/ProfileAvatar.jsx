import { AVATAR_API_URL } from "../constants";

export const ProfileAvatar = ({ initial, name }) => {
  const avatarUrl = AVATAR_API_URL(initial);
  
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="h-28 w-28 rounded-full border-4 border-primary/20 overflow-hidden mb-4 shadow-md bg-secondary">
        <img
          src={avatarUrl}
          alt="Profile Preview"
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-2xl font-bold text-foreground tracking-tight">
        Chef {name || "User"}
      </h2>
    </div>
  );
};