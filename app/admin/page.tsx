import { cookies } from "next/headers";
import Link from "next/link";
import { verifyAdminSecret, ADMIN_SECRET_COOKIE } from "@/lib/admin";
import { BrandMark } from "../brand-mark";
import { AdminLogin } from "./login-form";
import { AdminDashboard } from "./dashboard";
import { signOut } from "./sign-out";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const secret = cookieStore.get(ADMIN_SECRET_COOKIE)?.value ?? null;
  const authed = verifyAdminSecret(secret);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6 sm:py-12">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-56"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(99,102,241,0.14), transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto w-full max-w-3xl lg:max-w-5xl">
        {authed ? (
          <>
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center gap-3">
                <BrandMark />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                    MySpace Admin
                  </h1>
                  <p className="mt-0.5 text-sm text-zinc-500">
                    Manage your profile, links, and AI copy.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/"
                  className="btn-secondary px-3.5 py-2"
                >
                  View public page
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 shadow-sm transition hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </header>
            <AdminDashboard />
            <footer className="mt-10 text-center">
              <Link
                href="/builders-note"
                className="text-sm font-medium text-zinc-400 transition hover:text-brand-600"
              >
                Builder&apos;s Note
              </Link>
            </footer>
          </>
        ) : (
          <AdminLogin />
        )}
      </div>
    </main>
  );
}
