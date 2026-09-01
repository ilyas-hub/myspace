import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindOne = vi.fn();
const mockLinkFind = vi.fn();

vi.mock("../db/connect", () => ({ dbConnect: vi.fn() }));
vi.mock("../db/models", () => ({
  Profile: { findOne: (...a: unknown[]) => mockFindOne(...a) },
  Link: { find: (...a: unknown[]) => mockLinkFind(...a) },
}));

import { fetchPublicProfile } from "../public-profile";

let sortArg: unknown;
function linkSort(links: unknown[]) {
  return {
    sort: (sort: unknown) => {
      sortArg = sort;
      return { lean: () => Promise.resolve(links) };
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fetchPublicProfile", () => {
  it("returns null when the profile does not exist", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve(null) });

    expect(await fetchPublicProfile("ghost")).toBeNull();
    expect(mockLinkFind).not.toHaveBeenCalled();
  });

  it("queries the link list by profileId filtered to enabled", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "abc" }) });
    mockLinkFind.mockReturnValue(linkSort([{ _id: "l1" }]));

    const data = await fetchPublicProfile("alex");

    expect(mockLinkFind).toHaveBeenCalledWith({
      profileId: "abc",
      enabled: true,
    });
    expect(data?.links).toEqual([{ _id: "l1" }]);
  });

  it("sorts the enabled links by position ascending", async () => {
    mockFindOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "abc" }) });
    mockLinkFind.mockReturnValue(linkSort([{ _id: "l2" }, { _id: "l1" }]));

    await fetchPublicProfile("alex");

    expect(sortArg).toEqual({ position: 1 });
  });
});