import { User, Save } from "lucide-react";

export const ProfileForm = ({ firstName, onNameChange, onSave, isSaving }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
          <User className="w-4 h-4 text-primary" /> Full Name
        </label>
        {/* Changed bg-primary-foreground to bg-card dark:bg-muted/20 with strict text-foreground to fix contrast */}
        <input
          className="w-full p-4 bg-card dark:bg-muted/20 border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm text-foreground placeholder-muted-foreground/60 font-medium"
          value={firstName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter your full name"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-background text-primary-foreground py-4 rounded-2xl font-bold hover:bg-background/50 transition-all flex items-center justify-center gap-2 border cursor-pointer"
      >
        <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};
