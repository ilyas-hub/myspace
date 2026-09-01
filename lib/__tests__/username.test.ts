import { describe, it, expect } from "vitest";
import {
  validateUsername,
  USERNAME_ERROR_MESSAGE,
  MAX_USERNAME_LENGTH,
} from "../username";

describe("validateUsername", () => {
  it("accepts a normal URL-safe username", () => {
    expect(validateUsername("alex")).toBeNull();
    expect(validateUsername("alex_rivera")).toBeNull();
    expect(validateUsername("a.b-c")).toBeNull();
  });

  it("rejects missing / blank usernames", () => {
    expect(validateUsername("")).toBe("missing");
    expect(validateUsername("   ")).toBe("missing");
    expect(validateUsername(undefined as unknown as string)).toBe("missing");
  });

  it("rejects usernames with spaces or whitespace", () => {
    expect(validateUsername("Mohd Ilyas Shaikh")).toBe("invalidCharacters");
    expect(validateUsername("alex ")).toBe("invalidCharacters");
  });

  it("rejects characters that are not URL-path-safe", () => {
    expect(validateUsername("alex!")).toBe("invalidCharacters");
    expect(validateUsername("alex@name")).toBe("invalidCharacters");
    expect(validateUsername("alex/name")).toBe("invalidCharacters");
  });

  it("rejects over-long usernames", () => {
    expect(validateUsername("a".repeat(MAX_USERNAME_LENGTH))).toBeNull();
    expect(
      validateUsername("a".repeat(MAX_USERNAME_LENGTH + 1)),
    ).toBe("tooLong");
  });
});

describe("USERNAME_ERROR_MESSAGE", () => {
  it("includes the rules for invalid characters", () => {
    expect(USERNAME_ERROR_MESSAGE.invalidCharacters).toMatch(/no spaces/);
  });
});
