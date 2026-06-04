import { AlertCircle } from "lucide-react";

export const ErrorState = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
      <button onClick={onDismiss} className="text-red-700 hover:text-red-900">
        ×
      </button>
    </div>
  );
};