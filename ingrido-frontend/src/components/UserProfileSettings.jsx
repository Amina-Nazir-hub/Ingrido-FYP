import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { User, Save, Mail, ChevronLeft, Trash2, AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function UserProfileSettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState({
    first_name: "",
    email: "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem("ingrido_token");

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://127.0.0.1:8000/api/accounts/profile/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        setProfile({
          first_name: res.data.first_name || "",
          email: res.data.email || "",
        });
        if (res.data.first_name) {
          localStorage.setItem("user_name", res.data.first_name);
          window.dispatchEvent(new Event("storage_updated"));
        }
      })
      .catch((err) => console.error("Profile load error"));
  }, [token]);

  const handleSave = async () => {
    try {
      const dataToSend = {
        first_name: profile.first_name,
        health_conditions: [],
        dietary_preferences: [],
      };

      await axios.put("http://127.0.0.1:8000/api/accounts/profile/", dataToSend, {
        headers: { Authorization: `Token ${token}` },
      });
      localStorage.setItem("user_name", profile.first_name);
      window.dispatchEvent(new Event("storage_updated"));

      alert("Profile Saved! ✨");
      navigate("/dashboard");
    } catch (err) {
      alert("Update failed!");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await axios.delete("http://127.0.0.1:8000/api/accounts/delete-account/", {
        headers: { Authorization: `Token ${token}` },
      });
      logout();
      localStorage.clear();
      window.dispatchEvent(new Event("storage_updated"));
      window.location.href = "/";
      
    } catch (err) {
      console.error("Account deletion failed:", err);
      alert("Failed to delete account. Please try again.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Logout function
  const handleLogout = () => {
    logout();
    localStorage.clear();
    window.dispatchEvent(new Event("storage_updated"));
    navigate("/");
  };

  const nameForInitial = profile.first_name || "User";
  const cardInitial = nameForInitial.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-12 pt-32 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1 text-sm font-bold text-primary hover:text-secondary transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="h-28 w-28 rounded-full border-4 border-primary/20 overflow-hidden mb-4 shadow-md bg-secondary">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${cardInitial}&backgroundColor=00acc1,1e88e5,5e35b1&fontSize=40&fontWeight=700`}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Chef {profile.first_name || "User"}
            </h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1">
              <Mail className="w-3 h-3" /> {profile.email}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Full Name
              </label>
              <input
                className="w-full p-4 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg mt-4 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" /> Save Changes
            </button>

            {/* Logout Button*/}
            <button
              onClick={handleLogout}
              className="w-full bg-orange-50 text-orange-600 py-4 rounded-2xl font-bold hover:bg-orange-100 transition-all flex items-center justify-center gap-2 border border-orange-200"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>

            {/* Delete Account Section */}
            <div className="border-t border-red-200 pt-6 mt-4">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200"
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Delete Account?</h3>
            </div>
            
            <p className="text-muted-foreground mb-6">
              Are you sure you want to permanently delete your account? 
              This action cannot be undone and all your data will be lost forever.
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