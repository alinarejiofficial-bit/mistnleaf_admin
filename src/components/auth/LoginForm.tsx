"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { MistnLeafLogo } from "@/components/brand/MistnLeafLogo";

export function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@mistnleaf.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = login(email, password);
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
            Sign in with the email and password set by Super Administrator.
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
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-foreground">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none transition focus:border-brand-mid focus:ring-2 focus:ring-brand-soft"
              required
            />
          </label>

          {error ? (
            <p className="text-sm text-danger" role="alert">
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

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmail("admin@mistnleaf.com");
              setPassword("Admin@123");
              setError("");
            }}
            className="w-full rounded-xl border border-border-subtle bg-surface-muted/70 px-3.5 py-3 text-left text-xs text-muted transition hover:bg-surface-muted"
          >
            <p className="font-medium text-foreground">Demo Super Admin</p>
            <p className="mt-1">admin@mistnleaf.com</p>
            <p>Admin@123</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("neha@mistnleaf.com");
              setPassword("Staff@123");
              setError("");
            }}
            className="w-full rounded-xl border border-accent/30 bg-accent-soft/50 px-3.5 py-3 text-left text-xs text-muted transition hover:bg-accent-soft"
          >
            <p className="font-medium text-foreground">Demo Resort Manager</p>
            <p className="mt-1">neha@mistnleaf.com</p>
            <p>Staff@123</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("arjun@mistnleaf.com");
              setPassword("Staff@123");
              setError("");
            }}
            className="w-full rounded-xl border border-info/30 bg-[#e7f0f5]/70 px-3.5 py-3 text-left text-xs text-muted transition hover:bg-[#e7f0f5]"
          >
            <p className="font-medium text-foreground">Demo Front Desk</p>
            <p className="mt-1">arjun@mistnleaf.com</p>
            <p>Staff@123</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("sofia@mistnleaf.com");
              setPassword("Staff@123");
              setError("");
            }}
            className="w-full rounded-xl border border-success/30 bg-[#e8f3ec]/70 px-3.5 py-3 text-left text-xs text-muted transition hover:bg-[#e8f3ec]"
          >
            <p className="font-medium text-foreground">Demo Housekeeping</p>
            <p className="mt-1">sofia@mistnleaf.com</p>
            <p>Staff@123</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("kavya@mistnleaf.com");
              setPassword("Staff@123");
              setError("");
            }}
            className="w-full rounded-xl border border-[#4a5d6a]/30 bg-[#e8eef1]/80 px-3.5 py-3 text-left text-xs text-muted transition hover:bg-[#e8eef1]"
          >
            <p className="font-medium text-foreground">Demo Accountant</p>
            <p className="mt-1">kavya@mistnleaf.com</p>
            <p>Staff@123</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("ishaan@mistnleaf.com");
              setPassword("Staff@123");
              setError("");
            }}
            className="w-full rounded-xl border border-brand/30 bg-brand-soft/50 px-3.5 py-3 text-left text-xs text-muted transition hover:bg-brand-soft"
          >
            <p className="font-medium text-foreground">Demo Website CMS</p>
            <p className="mt-1">ishaan@mistnleaf.com</p>
            <p>Staff@123</p>
          </button>
          <p className="text-center text-xs text-muted">
            All staff use this same login page — your role is determined by your account.
          </p>
        </div>
      </div>
    </div>
  );
}
