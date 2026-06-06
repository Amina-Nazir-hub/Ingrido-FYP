import { Trash2, AlertTriangle, LogOut } from "lucide-react";
import { BackButton } from "./components/BackButton";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileForm } from "./components/ProfileForm";
import { ErrorState } from "./components/ErrorState";
import { LoadingState } from "./components/LoadingState";
import { useProfile } from "./hooks/useProfile";
import { ROUTES } from "./constants";

export function ProfilePage() {
  const {
    profile,
    loading,
    saving,
    isDeleting,
    showDeleteConfirm,
    error,
    cardInitial,
    updateField,
    handleSave,
    handleDeleteAccount,
    handleLogout,
    setShowDeleteConfirm,
    navigate,
  } = useProfile();

  const onSave = async () => {
    const success = await handleSave();
    if (success) {
      alert("Profile Saved! ✨");
      navigate(ROUTES.DASHBOARD);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-background pb-12 pt-32 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-card rounded-3xl border-2 border-primary shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center">
          <BackButton onClick={() => navigate(ROUTES.DASHBOARD)} />
        </div>

        <div className="p-8">
          <ProfileHeader
            firstName={profile.first_name}
            email={profile.email}
            initial={cardInitial}
          />

          <ErrorState error={error} onDismiss={() => {}} />

          <div className="space-y-6">
            <ProfileForm
              firstName={profile.first_name}
              onNameChange={(value) => updateField("first_name", value)}
              onSave={onSave}
              isSaving={saving}
            />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full bg-background text-primary-foreground py-4 rounded-2xl font-bold hover:bg-background/50 transition-all flex items-center justify-center gap-2 border cursor-pointer"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>

            {/* Delete Account Section */}
            <div className="border-t pt-6 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-5 h-5" /> Delete Account
              </button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                ⚠️ This action is permanent. All your data will be deleted.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Delete Account?
              </h3>
            </div>

            <p className="text-muted-foreground mb-6">
              Are you sure you want to permanently delete your account? This
              action cannot be undone and all your data will be lost forever.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-border font-medium hover:bg-muted/20 transition-all"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" /> Yes, Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
