import React from "react";
import RegisterHeader from "./components/RegisterHeader";
import RegisterForm from "./components/RegisterForm";
import { useRegisterForm } from "./hooks/useRegisterForm";
import { AlertCircle } from "lucide-react";

const RegisterPage = () => {
  const {
    formData,
    handleChange,
    handleHealthConditionsChange,
    handleDietaryPreferencesChange,
    handleSubmit,
    isPasswordValid,
    isPasswordFocused,
    setIsPasswordFocused,
    isLoading={isLoading} ,
    error,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 bg-background font-sans text-center">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="bg-card p-8 md:p-12 rounded-lg shadow-card border border-border">
          
          <RegisterHeader />
          
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700 transition-colors"
              >
                ×
              </button>
            </div>
          )}
          
          <RegisterForm
            formData={formData}
            onInputChange={handleChange}
            onHealthConditionsChange={handleHealthConditionsChange}
            onDietaryPreferencesChange={handleDietaryPreferencesChange}
            onSubmit={handleSubmit}
            isPasswordValid={isPasswordValid}
            isPasswordFocused={isPasswordFocused}
            setIsPasswordFocused={setIsPasswordFocused}
            isLoading={isLoading}
          />
          
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;