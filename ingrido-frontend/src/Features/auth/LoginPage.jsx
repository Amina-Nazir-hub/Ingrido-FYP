import React from "react";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import LoginFooter from "./components/LoginFooter";
import { useLoginForm } from "./hooks/useLoginForm";
import { AlertCircle } from "lucide-react";

const LoginPage = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    setError,
    handleSubmit,
  } = useLoginForm();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 transition-all duration-300">
          
          {/* Header Section */}
          <LoginHeader />
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                {error}
              </p>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          {/* Login Form */}
          <LoginForm
            email={email}
            password={password}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
          
          {/* Footer Section */}
          <LoginFooter />
          
          {/* Demo Credentials Hint (Optional - remove in production) */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-center text-gray-400 dark:text-gray-600">
              Demo: demo@example.com / demo123
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;