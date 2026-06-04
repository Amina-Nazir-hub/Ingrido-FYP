import { AlertCircle } from "lucide-react";

const ErrorState = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
      <AlertCircle /> {error}
      <button onClick={onDismiss} className="ml-auto text-red-700 hover:text-red-900">×</button>
    </div>
  );
};

export default ErrorState;