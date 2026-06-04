import { AlertCircle } from "lucide-react";

export const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
      <p className="text-red-600 mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  </div>
);