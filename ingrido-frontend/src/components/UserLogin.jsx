import { useLoginForm } from "../hooks/UserLoginForm";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
export function UserLogin() {
  const { loginData, handleChange, handleSubmit } = useLoginForm();
  const navigate = useNavigate();
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await handleSubmit(e);
      if (res) {
        navigate("/dashboard");
      }
    } catch (err) {
      alert("Invalid Credentials. Please try again.");
    }
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleOnSubmit}
        className="w-full max-w-md p-8 bg-card rounded-3xl shadow-xl border border-border"
      >
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
          <UtensilsCrossed size={32} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2 font-display text-foreground">
          Welcome Back
        </h1>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Please enter your details
        </p>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground ml-1">
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={loginData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="name@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground ml-1">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-secondary shadow-md transition-all active:scale-95 mt-4"
          >
            Sign In
          </button>
        </div>
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-primary font-bold hover:underline"
          >
            Sign Up
          </a>
        </p>
      </form>
    </main>
  );
}
