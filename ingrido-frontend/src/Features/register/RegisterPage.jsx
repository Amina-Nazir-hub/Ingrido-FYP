import React from "react";
import RegisterHeader from "./components/RegisterHeader";
import RegisterForm from "./components/RegisterForm";
import { useRegisterForm } from "./hooks/useRegisterForm";

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
    isLoading,
    error,
    setError,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 pt-28 bg-background font-sans text-center">
      <div className="w-full max-w-2xl animate-fade-up">
        <div className="bg-card p-8 md:p-12 rounded-3xl shadow-card border-2 border-primary">
          <RegisterHeader />

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