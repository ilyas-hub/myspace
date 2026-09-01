import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { ADMIN_SECRET_HEADER } from "@/lib/admin";

const SECRET = "test-secret";
const HEADERS = { [ADMIN_SECRET_HEADER]: SECRET };

const mockFindOne = vi.fn();
const mockCreate = vi.fn();
const mockFindByIdAndUpdate = vi.fn();

vi.mock("@/lib/db/connect", () => ({ dbConnect: vi.fn() }));
vi.mock("@/lib/db/models", () => ({
  Profile: {
    findOne: (...a: unknown[]) => mockFindOne(...a),
    create: (...a: unknown[]) => mockCreate(...a),
    findByIdAndUpdate: (...a: unknown[]) => mockFindByIdAndUpdate(...a),
  },
}));

import { GET, POST, PATCH } from "@/app/api/profile/route";

function req(method: string, body: Record<string, unknown>) {
  return new NextRequest("http://localhost/api/profile", {
    method,
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

// ── Auth ───────────────────────────────────────────────────────
describe("admin gate", () => {
  it("returns 401 when secret is missing", async () => {
    const r = new NextRequest("http://localhost/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await POST(r);
    expect(res.status).toBe(401);
  });
});

// ── GET ────────────────────────────────────────────────────────
describe("GET /api/profile", () => {
  it("returns 401 when secret is missing", async () => {
    const r = new NextRequest("http://localhost/api/profile", {
      method: "GET",
    });
    const res = await GET(r);
    expect(res.status).toBe(401);
  });

  it("returns the profile when one exists", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "p1", username: "alex" }) });

    const res = await GET(
      new NextRequest("http://localhost/api/profile", { headers: HEADERS }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ _id: "p1", username: "alex" });
  });

  it("returns null when no profile exists", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve(null) });

    const res = await GET(
      new NextRequest("http://localhost/api/profile", { headers: HEADERS }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });
});

// ── POST (create) ──────────────────────────────────────────────
describe("POST /api/profile", () => {
  it("returns 400 when username is missing", async () => {
    const res = await POST(req("POST", { displayName: "Alex" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid themeId", async () => {
    const res = await POST(
      req("POST", { username: "alex", themeId: "nope" }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 409 when username is taken", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "existing" }) });

    const res = await POST(req("POST", { username: "alex" }));
    expect(res.status).toBe(409);
  });

  it("creates a profile and returns 201", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    const created = { _id: "new", username: "alex" };
    mockCreate.mockResolvedValue(created);

    const res = await POST(
      req("POST", { username: "alex", displayName: "Alex", bio: "Music maker" }),
    );
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(created);
  });

  it("accepts a valid themeId", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve(null) });
    mockCreate.mockResolvedValue({ _id: "new", username: "alex", themeId: "midnight" });

    const res = await POST(
      req("POST", { username: "alex", themeId: "midnight" }),
    );
    expect(res.status).toBe(201);
  });
});

// ── PATCH (update) ─────────────────────────────────────────────
describe("PATCH /api/profile", () => {
  it("returns 400 when id is missing", async () => {
    const res = await PATCH(req("PATCH", { bio: "new bio" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid themeId", async () => {
    const res = await PATCH(req("PATCH", { id: "abc", themeId: "nope" }));
    expect(res.status).toBe(400);
  });

  it("returns 404 when profile not found", async () => {
    mockFindByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(null) });

    const res = await PATCH(req("PATCH", { id: "nope", bio: "x" }));
    expect(res.status).toBe(404);
  });

  it("returns 409 when username already taken", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "other" }) });

    const res = await PATCH(req("PATCH", { id: "abc", username: "taken" }));
    expect(res.status).toBe(409);
  });

  it("updates and returns the profile", async () => {
    const updated = { _id: "abc", bio: "new bio" };
    mockFindByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(updated) });

    const res = await PATCH(req("PATCH", { id: "abc", bio: "new bio" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });

  it("updates theme when valid", async () => {
    const updated = { _id: "abc", themeId: "warm" };
    mockFindByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(updated) });

    const res = await PATCH(req("PATCH", { id: "abc", themeId: "warm" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(updated);
  });
});
