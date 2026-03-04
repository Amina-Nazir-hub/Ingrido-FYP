import { Mail, Lock, UtensilsCrossed } from "lucide-react";
import { useLoginForm } from "../hooks/UserLoginForm";

export function UserLogin() {
  const { loginData, handleChange, handleSubmit } = useLoginForm();

  return (
    <main className="flex-1 pt-24 bg-background font-sans">
      <section className="min-h-[80vh] flex items-center justify-center py-16">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl max-w-md mx-auto p-8 bg-card shadow-card border border-border">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
              </div>
              <h1 className="font-display text-2xl font-bold">Welcome Back!</h1>
              <p className="text-muted-foreground text-sm mt-2">
                Sign in to your account
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={loginData.email}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-input px-10 bg-background focus:ring-2 focus:ring-ring outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={loginData.password}
                    onChange={handleChange}
                    className="w-full h-11 rounded-xl border border-input px-10 bg-background focus:ring-2 focus:ring-ring outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-secondary transition-opacity text-secondary-foreground h-12 rounded-xl font-semibold"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}