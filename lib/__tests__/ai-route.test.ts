import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { ADMIN_SECRET_HEADER } from "@/lib/admin";

const SECRET = "test-secret";
const HEADERS = { [ADMIN_SECRET_HEADER]: SECRET };

const mockGenerateBio = vi.fn();
const mockGenerateLinkCaptions = vi.fn();

vi.mock("@/lib/ai/generator", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("@/lib/ai/generator")>();
  return {
    ...original,
    generateBio: (...a: unknown[]) => mockGenerateBio(...a),
    generateLinkCaptions: (...a: unknown[]) => mockGenerateLinkCaptions(...a),
  };
});

import { POST } from "@/app/api/ai/route";

function req(body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json", ...HEADERS },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.ADMIN_SECRET = SECRET;
  vi.clearAllMocks();
});

afterEach(() => {
  delete process.env.ADMIN_SECRET;
});

describe("admin gate", () => {
  it("returns 401 when the secret is missing/wrong", async () => {
    const r = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ mode: "bio", keywords: ["music"] }),
    });
    const res = await POST(r);
    expect(res.status).toBe(401);
  });
});

describe("POST /api/ai", () => {
  it("returns 400 for an invalid JSON body", async () => {
    const r = new NextRequest("http://localhost/api/ai", {
      method: "POST",
      headers: { "content-type": "application/json", ...HEADERS },
      body: "{not json",
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it("returns 400 for an unsupported mode", async () => {
    const res = await POST(req({ mode: "video" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when a bio request has no keywords", async () => {
    const res = await POST(req({ mode: "bio", keywords: [] }));
    expect(res.status).toBe(400);
    expect(mockGenerateBio).not.toHaveBeenCalled();
  });

  it("returns a bio for 200 when generation succeeds", async () => {
    mockGenerateBio.mockResolvedValue("I make music and art.");
    const res = await POST(req({ mode: "bio", keywords: ["music", "art"] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ bio: "I make music and art." });
    expect(mockGenerateBio).toHaveBeenCalledWith(["music", "art"]);
  });

  it("returns 502 when bio generation fails", async () => {
    mockGenerateBio.mockRejectedValue(new Error("provider down"));
    const res = await POST(req({ mode: "bio", keywords: ["music"] }));
    expect(res.status).toBe(502);
  });

  it("returns 400 when a links request has no usable links", async () => {
    const res = await POST(req({ mode: "links", links: [{ label: "x" }] }));
    expect(res.status).toBe(400);
    expect(mockGenerateLinkCaptions).not.toHaveBeenCalled();
  });

  it("returns captions for 200 when generation succeeds", async () => {
    mockGenerateLinkCaptions.mockResolvedValue([
      { label: "Music", caption: "Listen" },
    ]);
    const res = await POST(
      req({ mode: "links", links: [{ url: "https://a.com", label: "Music" }] }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      captions: [{ label: "Music", caption: "Listen" }],
    });
    expect(mockGenerateLinkCaptions).toHaveBeenCalledWith([
      { url: "https://a.com", label: "Music" },
    ]);
  });

  it("returns 502 when link caption generation fails", async () => {
    mockGenerateLinkCaptions.mockRejectedValue(new Error("provider down"));
    const res = await POST(
      req({ mode: "links", links: [{ url: "https://a.com" }] }),
    );
    expect(res.status).toBe(502);
  });
});
