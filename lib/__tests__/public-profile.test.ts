import { describe, it, expect, vi, beforeEach } from "vitest";
import { PRESETS, PRESET_BY_ID, DEFAULT_THEME_ID } from "../themes";
import { resolvePreset } from "../public-profile";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("preset set", () => {
  it("exposes every preset via PRESET_BY_ID", () => {
    for (const p of PRESETS) expect(PRESET_BY_ID[p.id]).toBe(p);
  });

  it("defaults to mono", () => {
    expect(DEFAULT_THEME_ID).toBe("mono");
    expect(PRESET_BY_ID[DEFAULT_THEME_ID]).toBeDefined();
  });
});

describe("resolvePreset", () => {
  it("returns the preset matching a themeId", () => {
    expect(resolvePreset("warm")).toBe(PRESET_BY_ID["warm"]);
  });

  it("falls back to default when themeId is missing", () => {
    expect(resolvePreset()).toBe(PRESET_BY_ID[DEFAULT_THEME_ID]);
    expect(resolvePreset(undefined)).toBe(PRESET_BY_ID[DEFAULT_THEME_ID]);
  });

  it("falls back to default for an unknown themeId", () => {
    expect(resolvePreset("nope")).toBe(PRESET_BY_ID[DEFAULT_THEME_ID]);
  });
});