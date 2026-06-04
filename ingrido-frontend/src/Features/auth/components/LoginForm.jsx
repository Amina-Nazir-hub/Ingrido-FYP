import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const LoginForm = ({ email, password, onEmailChange, onPasswordChange, onSubmit, isLoading }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600" />
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            placeholder="name@example.com"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-600" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-200"
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold hover:from-amber-700 hover:to-amber-600 shadow-md transition-all duration-200 active:scale-95 mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing In...</span>
          </div>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
};

export default LoginForm;