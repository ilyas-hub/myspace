import { describe, it, expect } from "vitest";
import {
  interpretClicks,
  buildInsightCta,
  type ClickableLink,
} from "../click-insights";

const link = (label: string, clickCount: number): ClickableLink => ({
  _id: label,
  label,
  clickCount,
});

describe("interpretClicks", () => {
  it("returns null for an empty link list", () => {
    expect(interpretClicks([])).toBeNull();
  });

  it("returns null when all links have zero clicks", () => {
    expect(interpretClicks([link("A", 0), link("B", 0)])).toBeNull();
  });

  it("identifies the most-clicked link by label", () => {
    const links = [link("Store", 3), link("Music", 10), link("Booking", 1)];
    expect(interpretClicks(links)).toBe(
      "Most clicks went to Music (14 total clicks across 3 links).",
    );
  });

  it("picks the first max when there is a tie", () => {
    const links = [link("A", 5), link("B", 5), link("C", 2)];
    expect(interpretClicks(links)).toBe("Most clicks went to A.");
  });

  it("handles a single link", () => {
    expect(interpretClicks([link("Only", 7)])).toBe(
      "Most clicks went to Only.",
    );
  });

  it("reports total clicks alongside the top link when >1 link has clicks", () => {
    const links = [link("A", 8), link("B", 3), link("C", 1)];
    expect(interpretClicks(links)).toBe(
      "Most clicks went to A (12 total clicks across 3 links).",
    );
  });

  it("does not include total when only one link has clicks", () => {
    const links = [link("A", 5), link("B", 0)];
    expect(interpretClicks(links)).toBe("Most clicks went to A.");
  });
});

describe("buildInsightCta", () => {
  it("returns null for an empty link list", () => {
    expect(buildInsightCta([])).toBeNull();
  });

  it("returns null when all links have zero clicks", () => {
    expect(buildInsightCta([link("A", 0)])).toBeNull();
  });

  it("returns a CTA suggesting to feature the top link higher", () => {
    const links = [link("Store", 12), link("Music", 3)];
    expect(buildInsightCta(links)).toBe(
      'Most clicks go to Store  consider featuring it higher.',
    );
  });

  it("handles a single link with clicks", () => {
    const links = [link("Only", 1)];
    expect(buildInsightCta(links)).toBe(
      'Most clicks go to Only  consider featuring it higher.',
    );
  });
});
