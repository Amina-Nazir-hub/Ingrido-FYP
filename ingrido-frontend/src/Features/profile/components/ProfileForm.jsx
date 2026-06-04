import { User, Save } from "lucide-react";

export const ProfileForm = ({ firstName, onNameChange, onSave, isSaving }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Full Name
        </label>
        <input
          className="w-full p-4 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
          value={firstName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};