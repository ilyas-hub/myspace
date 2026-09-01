import { cookies } from "next/headers";
import Link from "next/link";
import { verifyAdminSecret, ADMIN_SECRET_COOKIE } from "@/lib/admin";
import { AdminLogin } from "./login-form";
import { AdminDashboard } from "./dashboard";
import { signOut } from "./sign-out";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const secret = cookieStore.get(ADMIN_SECRET_COOKIE)?.value ?? null;
  const authed = verifyAdminSecret(secret);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {authed ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">MySpace Admin</h1>
                <p className="mt-0.5 text-sm text-zinc-500">
                  Manage your profile, links, and AI copy.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                >
                  View public page
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
            <AdminDashboard />
          </>
        ) : (
          <AdminLogin />
        )}
      </div>
    </main>
  );
}