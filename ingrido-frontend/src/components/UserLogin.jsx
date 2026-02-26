import React from 'react';
import { Mail, Lock, UtensilsCrossed } from 'lucide-react';

export function UserLogin() {

  return (

    <main className="flex-1 pt-24 bg-background font-sans">

      <section className="min-h-[80vh] flex items-center justify-center py-16">

        <div className="container mx-auto px-4">

          <div className="rounded-2xl max-w-md mx-auto p-8 bg-card shadow-card">

            {/* Logo */}
            <div className="text-center mb-8">

              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">

                <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />

              </div>

              <h1 className="font-display text-2xl font-bold">
                Welcome Back!
              </h1>

              <p className="text-muted-foreground text-sm mt-2">
                Sign in to your account
              </p>

            </div>


            {/* Form */}

            <form className="space-y-4">

              <div>

                <label>Email</label>

                <div className="relative mt-1">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary"/>

                  <input
                    type="email"
                    className="w-full h-11 rounded-xl border border-input px-10"
                    placeholder="you@example.com"
                  />

                </div>

              </div>


              <div>

                <label>Password</label>

                <div className="relative mt-1">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary"/>

                  <input
                    type="password"
                    className="w-full h-11 rounded-xl border border-input px-10"
                    placeholder="••••••••"
                  />

                </div>

              </div>


              <button

                className="w-full bg-secondary text-primary-foreground h-12 rounded-xl"

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