"use client";

import { useState, type FormEvent } from "react";
import { ADMIN_SECRET_COOKIE } from "@/lib/admin";

export function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!secret) {
      setError("Enter the admin secret to continue.");
      return;
    }
    document.cookie = `${ADMIN_SECRET_COOKIE}=${encodeURIComponent(secret)}; path=/; max-age=86400; samesite=lax`;
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-lg font-semibold text-zinc-900">MySpace Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter the admin secret to manage your profile and links.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => {
              setSecret(e.target.value);
              setError("");
            }}
            placeholder="Admin secret"
            autoFocus
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}