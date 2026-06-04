import { RefreshCw, Trash2 } from "lucide-react";

const PlanActions = ({ onRegenerate, onDelete, generating }) => {
  return (
    <div className="flex gap-3">
      <button 
        onClick={onRegenerate} 
        disabled={generating}
        className="flex items-center gap-2 px-6 py-3 bg-[#b17b46] text-white rounded-xl shadow-lg hover:bg-[#8B5E3C] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw className={generating ? "animate-spin" : ""} /> 
        {generating ? "Generating..." : "Regenerate"}
      </button>
      <button 
        onClick={onDelete} 
        className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
      >
        <Trash2 /> Delete
      </button>
    </div>
  );
};

export default PlanActions;