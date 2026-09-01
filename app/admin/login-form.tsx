"use client";

import { useState, type FormEvent } from "react";
import { ADMIN_SECRET_COOKIE } from "@/lib/admin";
import { BrandMark } from "../brand-mark";

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
    <div className="flex min-h-[70vh] items-center justify-center sm:min-h-[75vh]">
      <div className="animate-fade-up w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm shadow-zinc-200/50 sm:p-10">
        <BrandMark />
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900">
          MySpace Admin
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
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
            className="field"
          />
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn-primary w-full py-2.5"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
