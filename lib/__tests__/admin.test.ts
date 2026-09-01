import { describe, it, expect, afterEach } from "vitest";
import { secretsMatch, verifyAdminSecret } from "../admin";

afterEach(() => {
  delete process.env.ADMIN_SECRET;
});

describe("secretsMatch", () => {
  it("returns true for an exact match", () => {
    expect(secretsMatch("abc123", "abc123")).toBe(true);
  });

  it("returns false for a different value", () => {
    expect(secretsMatch("abc123", "nope")).toBe(false);
  });

  it("returns false for a value of different length", () => {
    expect(secretsMatch("abc123", "abc")).toBe(false);
  });

  it("is timing-safe regardless of length", () => {
    expect(secretsMatch("abc123", "abcdef")).toBe(false);
  });
});

describe("verifyAdminSecret", () => {
  it("accepts the configured ADMIN_SECRET", () => {
    process.env.ADMIN_SECRET = "s3cret!";
    expect(verifyAdminSecret("s3cret!")).toBe(true);
  });

  it("rejects an incorrect secret", () => {
    process.env.ADMIN_SECRET = "s3cret!";
    expect(verifyAdminSecret("wrong")).toBe(false);
  });

  it("rejects when no ADMIN_SECRET is configured", () => {
    expect(verifyAdminSecret("anything")).toBe(false);
  });

  it("rejects null/undefined/empty input", () => {
    process.env.ADMIN_SECRET = "s3cret!";
    expect(verifyAdminSecret(null)).toBe(false);
    expect(verifyAdminSecret(undefined)).toBe(false);
    expect(verifyAdminSecret("")).toBe(false);
  });
});