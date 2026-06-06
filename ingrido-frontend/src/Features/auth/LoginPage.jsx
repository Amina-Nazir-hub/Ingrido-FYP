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
    <main className="min-h-screen flex items-center justify-center bg-background px-4 pb-12 pt-32">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-card p-8 transition-all duration-300 rounded-3xl border-primary border-2">
          {/* Header Section */}
          <LoginHeader />

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-center gap-2 animate-shake">
              <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0" />
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
          <div className="mt-6 pt-4 border-t ">
            <p className="text-xs text-center text-muted-foreground">
              Demo: demo@example.com / demo123
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
