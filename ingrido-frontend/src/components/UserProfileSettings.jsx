import { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { User, Heart, Salad, Save, Mail } from "lucide-react";

const ALL_HEALTH = [
  { value: "Diabetes", label: "Diabetes" },
  { value: "High Blood Pressure", label: "High Blood Pressure" },
  { value: "Heart Disease", label: "Heart Disease" }
];

const ALL_DIET = [
  { value: "Vegetarian", label: "Vegetarian" },
  { value: "Non-Vegetarian", label: "Non-Vegetarian" }
];

export function UserProfileSettings() {
  const [profile, setProfile] = useState({
    first_name: "",
    email: "",
    health_conditions: [],
    dietary_preferences: []
  });
  const token = localStorage.getItem("ingrido_token");

  useEffect(() => {
    if (!token) return;
    axios.get("http://127.0.0.1:8000/api/accounts/profile/", {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      const health = res.data.health_conditions?.map(h => ({ value: h, label: h })) || [];
      const diet = res.data.dietary_preferences?.map(d => ({ value: d, label: d })) || [];
      setProfile({ ...res.data, health_conditions: health, dietary_preferences: diet });
      if(res.data.first_name) localStorage.setItem("user_name", res.data.first_name);
    })
    .catch(err => console.error("Profile load error"));
  }, [token]);

  const handleSave = async () => {
    try {
      const dataToSend = {
        first_name: profile.first_name,
        health_conditions: profile.health_conditions.map(o => o.value),
        dietary_preferences: profile.dietary_preferences.map(o => o.value)
      };

      await axios.put("http://127.0.0.1:8000/api/accounts/profile/", dataToSend, {
        headers: { Authorization: `Token ${token}` }
      });

      localStorage.setItem("user_name", profile.first_name);
      alert("Profile Saved! ✨");
      window.location.reload(); 

    } catch (err) {
      alert("Update failed!");
    }
  };

  // 2 Letters for consistency
  const nameForInitial = profile.first_name || 'User';
  const cardInitial = (nameForInitial.length > 1) ? nameForInitial.substring(0, 2).toUpperCase() : nameForInitial.charAt(0).toUpperCase();

  return (
    <div className="max-w-xl mx-auto p-8 bg-card rounded-3xl border border-border mt-24 shadow-xl">
      <div className="flex flex-col items-center mb-8">
        {/* Profile Circle - Now matches Navbar exactly */}
        <div className="h-28 w-28 rounded-full border-4 border-primary/20 overflow-hidden mb-4 shadow-md bg-secondary">
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${cardInitial}&backgroundColor=00acc1,1e88e5,5e35b1&fontSize=40&fontWeight=700`} 
            alt="Profile Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Chef {profile.first_name || 'User'}</h2>
        <p className="text-muted-foreground text-sm flex items-center gap-1"><Mail className="w-3 h-3"/> {profile.email}</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Full Name</label>
          <input 
            className="w-full p-4 bg-background border rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={profile.first_name}
            onChange={(e) => setProfile({...profile, first_name: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2"><Heart className="w-4 h-4 text-red-500" /> Health Conditions</label>
          <Select isMulti options={ALL_HEALTH} value={profile.health_conditions} onChange={(s) => setProfile({...profile, health_conditions: s || []})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2"><Salad className="w-4 h-4 text-green-500" /> Dietary Preferences</label>
          <Select isMulti options={ALL_DIET} value={profile.dietary_preferences} onChange={(s) => setProfile({...profile, dietary_preferences: s || []})} />
        </div>

        <button onClick={handleSave} className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg mt-4">
          Save Changes
        </button>
      </div>
    </div>
  );
}