"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SECRET_COOKIE } from "@/lib/admin";

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SECRET_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
  redirect("/admin");
}