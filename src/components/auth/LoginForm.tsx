"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MistnLeafLogo } from "@/components/brand/MistnLeafLogo";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_10%_0%,rgb(227_239_233_/_0.9),transparent_55%),radial-gradient(700px_400px_at_90%_20%,rgb(245_239_230_/_0.75),transparent_50%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-md sm:p-8">
        <div className="mb-8 text-center">
          <MistnLeafLogo variant="full" priority className="mx-auto" />
          <h1 className="mt-4 font-display text-2xl tracking-tight text-foreground">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in with your staff email and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Email
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-surface px-3 pr-11 text-sm text-foreground outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted transition hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          </label>

          {error ? (
            <p className="text-sm font-medium text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-11 w-full rounded-xl bg-brand text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
