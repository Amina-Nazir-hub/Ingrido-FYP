import { UtensilsCrossed } from "lucide-react";

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-linear-to-r bg-primary-foreground rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
        <img className="w-15 h-15" src="/android-chrome-192x192.png" alt="Ingrido Logo" />
      </div>

      <h1 className="text-2xl font-bold mb-2 font-display text-gray-900 dark:text-white">
        Welcome Back
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm">
        Please enter your details
      </p>
    </div>
  );
};

export default LoginHeader;
