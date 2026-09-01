import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockFindById = vi.fn();
const mockCreate = vi.fn();
const mockFindByIdAndUpdate = vi.fn();

vi.mock("@/lib/db/connect", () => ({ dbConnect: vi.fn() }));
vi.mock("@/lib/db/models", () => ({
  Click: { create: (...a: unknown[]) => mockCreate(...a) },
  Link: {
    findById: (...a: unknown[]) => mockFindById(...a),
    findByIdAndUpdate: (...a: unknown[]) => mockFindByIdAndUpdate(...a),
  },
}));

import { POST } from "@/app/api/clicks/route";

function req(method: string, body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/clicks", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/clicks", () => {
  it("returns 400 when linkId is missing", async () => {
    const res = await POST(req("POST", {}));
    expect(res.status).toBe(400);
  });

  it("returns 400 when linkId is not a string", async () => {
    const res = await POST(req("POST", { linkId: 42 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for a malformed JSON body", async () => {
    const r = new NextRequest("http://localhost/api/clicks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not-json",
    });
    const res = await POST(r);
    expect(res.status).toBe(400);
  });

  it("returns 404 when the link does not exist", async () => {
    mockFindById.mockReturnValue({ lean: () => Promise.resolve(null) });

    const res = await POST(req("POST", { linkId: "nope" }));
    expect(res.status).toBe(404);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("records a Click and increments the link's clickCount", async () => {
    mockFindById.mockReturnValue({
      lean: () => Promise.resolve({
        _id: "l1",
        profileId: "p1",
        url: "https://x.com",
        label: "X",
      }),
    });
    mockCreate.mockImplementation(async (doc: Record<string, unknown>) => doc);

    const res = await POST(req("POST", { linkId: "l1" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalledWith({
      profileId: "p1",
      linkId: "l1",
      timestamp: expect.any(Date),
    });
    expect(mockFindByIdAndUpdate).toHaveBeenCalledWith("l1", {
      $inc: { clickCount: 1 },
    });
  });
});