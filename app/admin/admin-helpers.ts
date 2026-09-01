import { ADMIN_SECRET_COOKIE } from "@/lib/admin";

export function getAdminSecret(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_SECRET_COOKIE}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

export function adminFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const secret = getAdminSecret();
  const headers = new Headers(init.headers);
  headers.set("x-admin-secret", secret);
  if (init.body) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers });
}