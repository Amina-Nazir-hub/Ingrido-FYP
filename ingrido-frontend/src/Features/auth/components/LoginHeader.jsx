import { UtensilsCrossed } from "lucide-react";

const LoginHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-amber-600 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
        <UtensilsCrossed size={32} />
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