import { describe, it, expect } from "vitest";
import {
  normalizeKeywords,
  normalizeLinks,
  buildBioPrompt,
  buildLinksPrompt,
  parseBioResponse,
  parseLinksResponse,
} from "../ai/generator";

// ── normalization ───────────────────────────────────────────────
describe("normalizeKeywords", () => {
  it("filters to trimmed non-empty strings", () => {
    expect(
      normalizeKeywords(["  music  ", "producer", "", 42, " beats "]),
    ).toEqual(["music", "producer", "beats"]);
  });

  it("returns [] for non-array or empty input", () => {
    expect(normalizeKeywords(undefined)).toEqual([]);
    expect(normalizeKeywords("music")).toEqual([]);
    expect(normalizeKeywords([])).toEqual([]);
    expect(normalizeKeywords(["", "   "])).toEqual([]);
  });
});

describe("normalizeLinks", () => {
  it("keeps links with a url and trims label/url", () => {
    const links = normalizeLinks([
      { url: "  https://a.com  ", label: "  Store  " },
      { url: "https://b.com" },
      { url: "" },
      { url: "https://c.com", label: "   " },
      "nonsense",
    ]);
    expect(links).toEqual([
      { url: "https://a.com", label: "Store" },
      { url: "https://b.com", label: undefined },
      { url: "https://c.com", label: undefined },
    ]);
  });

  it("returns [] when nothing has a usable url", () => {
    expect(normalizeLinks([])).toEqual([]);
    expect(normalizeLinks([{ label: "no url" }])).toEqual([]);
  });
});

// ── prompt building ─────────────────────────────────────────────
describe("buildBioPrompt", () => {
  it("includes the keywords and demands plain text", () => {
    const prompt = buildBioPrompt(["music", "DJ"]);
    expect(prompt).toContain("music");
    expect(prompt).toContain("DJ");
    expect(prompt).toMatch(/only the bio text/i);
  });
});

describe("buildLinksPrompt", () => {
  it("lists each link and demands JSON", () => {
    const prompt = buildLinksPrompt([
      { label: "Store", url: "https://a.com" },
      { url: "https://b.com" },
    ]);
    expect(prompt).toContain("1. Store");
    expect(prompt).toContain("2. https://b.com");
    expect(prompt).toContain('"captions"');
  });
});

// ── parsing ─────────────────────────────────────────────────────
describe("parseBioResponse", () => {
  it("returns the trimmed bio text", () => {
    expect(parseBioResponse("  Hi, I'm Alex.  ")).toBe("Hi, I'm Alex.");
  });

  it("returns empty string for empty input", () => {
    expect(parseBioResponse("")).toBe("");
  });
});

describe("parseLinksResponse", () => {
  const links = [
    { label: "Music", url: "https://a.com" },
    { label: "Store", url: "https://b.com" },
  ];

  it("parses a bare JSON object", () => {
    const text =
      '{"captions":[{"index":1,"caption":"Hear my new single"},{"index":2,"caption":"Shop merch"}]}';
    expect(parseLinksResponse(text, links)).toEqual([
      { label: "Music", caption: "Hear my new single" },
      { label: "Store", caption: "Shop merch" },
    ]);
  });

  it("parses a JSON object wrapped in a code fence", () => {
    const text =
      '```json\n{"captions":[{"index":1,"caption":"Listen now"},{"index":2,"caption":"Grab a vinyl"}]}\n```';
    expect(parseLinksResponse(text, links)).toEqual([
      { label: "Music", caption: "Listen now" },
      { label: "Store", caption: "Grab a vinyl" },
    ]);
  });

  it("falls back to the link number for a missing label", () => {
    expect(
      parseLinksResponse(
        '{"captions":[{"index":1,"caption":"x"}]}',
        [{ url: "https://a.com" }],
      ),
    ).toEqual([{ label: "Link 1", caption: "x" }]);
  });

  it("returns [] when there is no usable JSON", () => {
    expect(parseLinksResponse("no json here", links)).toEqual([]);
    expect(parseLinksResponse("", links)).toEqual([]);
    expect(
      parseLinksResponse('{"captions":"nope"}', links),
    ).toEqual([]);
  });

  it("falls back to the link label for any link the model omits", () => {
    const text = '{"captions":[{"index":1,"caption":"ok"}]}';
    expect(parseLinksResponse(text, links)).toEqual([
      { label: "Music", caption: "ok" },
      { label: "Store", caption: "Store" },
    ]);
  });

  it("still maps one caption per link when none are usable", () => {
    const text =
      '{"captions":[{"caption":"no index"},{"index":3,"caption":5}]}';
    expect(parseLinksResponse(text, links)).toEqual([
      { label: "Music", caption: "Music" },
      { label: "Store", caption: "Store" },
    ]);
  });
});
