import { AVATAR_URL } from "../constants";

export const ProfileAvatar = ({ initial }) => {
  return (
    <div className="h-28 w-28 rounded-full border-4 border-primary/20 overflow-hidden mb-4 shadow-md bg-secondary">
      <img
        src={AVATAR_URL(initial)}
        alt="Profile Preview"
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default  ProfileAvatar;