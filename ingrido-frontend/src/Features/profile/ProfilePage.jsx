import { useProfile } from "./hooks/useProfile";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileAvatar } from "./components/ProfileAvatar";
import { ProfileForm } from "./components/ProfileForm";

export function ProfilePage() {
  const {
    profile,
    loading,
    error,
    saving,
    token,
    updateProfileField,
    saveProfile,
    goToDashboard,
    getUserInitial
  } = useProfile();

  const handleSave = async () => {
    const success = await saveProfile();
    if (success) {
      alert("Profile Saved! ✨");
      goToDashboard();
    } else {
      alert("Update failed!");
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error && !token) {
    return <ErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-32 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
        <ProfileHeader email={profile.email} onBack={goToDashboard} />
        
        <div className="p-8">
          <ProfileAvatar 
            initial={getUserInitial()} 
            name={profile.first_name} 
          />
          
          <ProfileForm
            profile={profile}
            onFieldChange={updateProfileField}
            onSave={handleSave}
            isSaving={saving}
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;