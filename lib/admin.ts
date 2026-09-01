import { timingSafeEqual } from "node:crypto";

export const ADMIN_SECRET_HEADER = "x-admin-secret";
export const ADMIN_SECRET_COOKIE = "admin_secret";

export function secretsMatch(input: string, expected: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyAdminSecret(input: string | null | undefined): boolean {
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !input) return false;
  return secretsMatch(input, expected);
}