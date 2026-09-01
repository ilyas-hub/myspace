import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { ADMIN_SECRET_HEADER } from "@/lib/admin";

const SECRET = "test-secret";
const HEADERS = { [ADMIN_SECRET_HEADER]: SECRET };

// ── Mocks ──────────────────────────────────────────────────────
const mockFind = vi.fn();
const mockFindByIdAndUpdate = vi.fn();
const mockFindByIdAndDelete = vi.fn();
const mockCreate = vi.fn();
const mockFindById = vi.fn();

vi.mock("@/lib/db/connect", () => ({ dbConnect: vi.fn() }));
vi.mock("@/lib/db/models", () => ({
  Link: {
    find: (...a: unknown[]) => mockFind(...a),
    create: (...a: unknown[]) => mockCreate(...a),
    findByIdAndUpdate: (...a: unknown[]) => mockFindByIdAndUpdate(...a),
    findByIdAndDelete: (...a: unknown[]) => mockFindByIdAndDelete(...a),
  },
  Profile: {
    findById: (...a: unknown[]) => mockFindById(...a),
  },
}));

import { GET, POST, PUT, DELETE } from "@/app/api/links/route";

function req(
  method: string,
  body?: Record<string, unknown>,
  query?: Record<string, string>,
) {
  const url = new URL("http://localhost/api/links");
  if (query) {
    for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  }
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json", ...HEADERS },
    body: body ? JSON.stringify(body) : undefined,
  });
}

beforeEach(() => {
  process.env.ADMIN_SECRET = SECRET;
  vi.clearAllMocks();
});

afterEach(() => {
  delete process.env.ADMIN_SECRET;
});

// ── Auth ───────────────────────────────────────────────────────
describe("admin gate", () => {
  it("returns 401 when secret is missing", async () => {
    const r = new NextRequest("http://localhost/api/links", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(r);
    expect(res.status).toBe(401);
  });

  it("returns 401 when secret is wrong", async () => {
    const r = new NextRequest("http://localhost/api/links", {
      method: "POST",
      headers: { "content-type": "application/json", [ADMIN_SECRET_HEADER]: "wrong" },
      body: JSON.stringify({}),
    });
    const res = await POST(r);
    expect(res.status).toBe(401);
  });
});

// ── GET ────────────────────────────────────────────────────────
describe("GET /api/links", () => {
  it("returns 400 when profileId is missing", async () => {
    const res = await GET(req("GET"));
    expect(res.status).toBe(400);
  });

  it("returns links sorted by position", async () => {
    const links = [{ label: "A" }, { label: "B" }];
    mockFind.mockReturnValue({ sort: () => ({ lean: () => Promise.resolve(links) }) });

    const res = await GET(req("GET", undefined, { profileId: "abc" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(links);
  });
});

// ── POST ───────────────────────────────────────────────────────
describe("POST /api/links", () => {
  it("returns 400 when required fields are missing", async () => {
    const res = await POST(req("POST", { profileId: "x" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when profile does not exist", async () => {
    mockFindById.mockReturnValue({ lean: () => Promise.resolve(null) });

    const res = await POST(
      req("POST", { profileId: "abc", url: "https://x.com", label: "X" }),
    );
    expect(res.status).toBe(404);
  });

  it("creates a link and returns 201", async () => {
    mockFindById.mockReturnValue({ lean: () => Promise.resolve({ _id: "abc" }) });
    const created = { _id: "new", url: "https://x.com", label: "X" };
    mockCreate.mockResolvedValue(created);

    const res = await POST(
      req("POST", { profileId: "abc", url: "https://x.com", label: "X" }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });
});

// ── PUT ────────────────────────────────────────────────────────
describe("PUT /api/links", () => {
  it("returns 400 when id is missing", async () => {
    const res = await PUT(req("PUT", { label: "Y" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when link not found", async () => {
    mockFindByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(null) });

    const res = await PUT(req("PUT", { id: "nope", label: "Y" }));
    expect(res.status).toBe(404);
  });

  it("updates and returns the link", async () => {
    const updated = { _id: "abc", label: "Y" };
    mockFindByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(updated) });

    const res = await PUT(req("PUT", { id: "abc", label: "Y" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });
});

// ── DELETE ─────────────────────────────────────────────────────
describe("DELETE /api/links", () => {
  it("returns 400 when id is missing", async () => {
    const res = await DELETE(req("DELETE", {}));
    expect(res.status).toBe(400);
  });

  it("returns 404 when link not found", async () => {
    mockFindByIdAndDelete.mockReturnValue({ lean: () => Promise.resolve(null) });

    const res = await DELETE(req("DELETE", { id: "nope" }));
    expect(res.status).toBe(404);
  });

  it("deletes and returns success", async () => {
    mockFindByIdAndDelete.mockReturnValue({ lean: () => Promise.resolve({ _id: "abc" }) });

    const res = await DELETE(req("DELETE", { id: "abc" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });
});
