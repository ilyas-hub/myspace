// Username is the public URL key (app/[username]). It must be valid in a
// URL path (letters, digits, and the path-safe separators) and not contain
// whitespace — a username such as "Mohd Ilyas Shaikh" would otherwise produce
// an ugly, hard-to-share `/[username]` URL.

export type UsernameError =
  | null
  | "missing"
  | "tooLong"
  | "invalidCharacters";

// Max length keeps the shareable/public URL reasonable.
export const MAX_USERNAME_LENGTH = 50;

const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

export function validateUsername(username: string): UsernameError {
  if (!username || username.trim().length === 0) return "missing";
  if (username.length > MAX_USERNAME_LENGTH) return "tooLong";
  if (!USERNAME_PATTERN.test(username)) return "invalidCharacters";
  return null;
}

export const USERNAME_ERROR_MESSAGE: Record<Exclude<UsernameError, null>, string> = {
  missing: "username is required",
  tooLong: `username must be at most ${MAX_USERNAME_LENGTH} characters`,
  invalidCharacters:
    "username may only contain letters, numbers, and . _ - (no spaces)",
};
