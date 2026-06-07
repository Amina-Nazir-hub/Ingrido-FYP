import React from "react";
import LoginHeader from "./components/LoginHeader";
import LoginForm from "./components/LoginForm";
import LoginFooter from "./components/LoginFooter";
import { useLoginForm } from "./hooks/useLoginForm";

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

          {/* Login Form - Old error alert removed */}
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
          <div className="mt-6 pt-4 border-t">
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