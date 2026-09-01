import { describe, it, expect } from "vitest";
import { Profile, Link, Click } from "../db/models";

const validProfile = () => ({
  username: "alex",
  displayName: "Alex",
  bio: "Music maker",
  avatarUrl: "https://store.public.blob.vercel-storage.com/av.png",
  themeId: "midnight",
  socials: [{ platform: "instagram", url: "https://instagram.com/alex" }],
});

async function expectValid(doc: { validate: () => Promise<unknown> }) {
  await expect(doc.validate()).resolves.toBeUndefined();
}

describe("Profile model", () => {
  it("accepts a valid profile", async () => {
    await expectValid(new Profile(validProfile()));
  });

  it("requires a username", async () => {
    const p = new Profile({ ...validProfile(), username: "" });
    let err: { errors?: Record<string, unknown> } | undefined;
    try {
      await p.validate();
    } catch (e) {
      err = e as { errors?: Record<string, unknown> };
    }
    expect(err?.errors?.username).toBeDefined();
  });

  it("requires a unique-indexed username", () => {
    const uniqueIndex = Profile.schema.indexes().some(
      ([fields, opts]) =>
        (fields as Record<string, number>).username === 1 &&
        opts.unique === true,
    );
    expect(uniqueIndex).toBe(true);
  });

  it("defaults themeId to mono", () => {
    const p = new Profile({
      username: validProfile().username,
      displayName: validProfile().displayName,
      bio: validProfile().bio,
      avatarUrl: validProfile().avatarUrl,
      socials: validProfile().socials,
    });
    expect(p.themeId).toBe("mono");
  });

  it("accepts an empty socials list", async () => {
    await expectValid(new Profile({ ...validProfile(), socials: [] }));
  });

  it("requires each social to have a platform and url", async () => {
    const p = new Profile({
      ...validProfile(),
      socials: [{ platform: "instagram" }],
    });
    let err: { errors?: Record<string, unknown> } | undefined;
    try {
      await p.validate();
    } catch (e) {
      err = e as { errors?: Record<string, unknown> };
    }
    expect(err?.errors?.["socials.0.url"]).toBeDefined();
  });

  it("accepts none of the optional fields", async () => {
    await expectValid(new Profile({ username: "alex" }));
  });
});

describe("Link model", () => {
  const validLink = () => ({
    profileId: new Profile(validProfile())._id,
    url: "https://example.com/track",
    label: "My latest track",
    position: 1,
  });

  it("accepts a valid link", async () => {
    await expectValid(new Link(validLink()));
  });

  it("requires url and label", async () => {
    const l = new Link({ ...validLink(), url: "", label: "" });
    let err: { errors?: Record<string, unknown> } | undefined;
    try {
      await l.validate();
    } catch (e) {
      err = e as { errors?: Record<string, unknown> };
    }
    expect(err?.errors?.url).toBeDefined();
    expect(err?.errors?.label).toBeDefined();
  });

  it("requires a profileId reference", async () => {
    const l = new Link({ url: "https://x.com", label: "x" });
    let err: { errors?: Record<string, unknown> } | undefined;
    try {
      await l.validate();
    } catch (e) {
      err = e as { errors?: Record<string, unknown> };
    }
    expect(err?.errors?.profileId).toBeDefined();
  });

  it("defaults enabled true, clickCount 0, position 0", () => {
    const l = new Link({
      profileId: validLink().profileId,
      url: validLink().url,
      label: validLink().label,
    });
    expect(l.enabled).toBe(true);
    expect(l.clickCount).toBe(0);
    expect(l.position).toBe(0);
  });

  it("accepts optional thumbnailUrl", async () => {
    await expectValid(
      new Link({
        ...validLink(),
        thumbnailUrl: "https://store.public.blob.vercel-storage.com/t.png",
      }),
    );
  });

  it("indexes profileId for the links-to-profile read", () => {
    const hasProfileIdIndex = Link.schema
      .indexes()
      .some(([fields]) => (fields as Record<string, number>).profileId === 1);
    expect(hasProfileIdIndex).toBe(true);
  });
});

describe("Click model", () => {
  const profileId = new Profile(validProfile())._id;
  const linkId = new Link({
    profileId,
    url: "https://example.com",
    label: "Link",
  })._id;

  it("accepts a minimal valid click", async () => {
    await expectValid(new Click({ profileId, linkId }));
  });

  it("defaults timestamp to now", () => {
    const c = new Click({ profileId, linkId });
    expect(c.timestamp).toBeInstanceOf(Date);
  });

  it("requires profileId and linkId", async () => {
    const c = new Click({});
    let err: { errors?: Record<string, unknown> } | undefined;
    try {
      await c.validate();
    } catch (e) {
      err = e as { errors?: Record<string, unknown> };
    }
    expect(err?.errors?.profileId).toBeDefined();
    expect(err?.errors?.linkId).toBeDefined();
  });

  it("compounds profileId + linkId index for per-link counts", () => {
    const hasCompound = Click.schema.indexes().some(([fields]) => {
      const f = fields as Record<string, number>;
      return f.profileId === 1 && f.linkId === 1;
    });
    expect(hasCompound).toBe(true);
  });
});