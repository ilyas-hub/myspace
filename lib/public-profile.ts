import { dbConnect } from "./db/connect";
import { Profile, Link, type Profile as ProfileDoc, type Link as LinkDoc } from "./db/models";
import { PRESET_BY_ID, DEFAULT_THEME_ID, type Preset } from "./themes";

export const SEEDED_USERNAME = "alex";

export type PublicProfile = ProfileDoc & { _id: unknown };
export type PublicLink = LinkDoc & { _id: unknown };

export function resolvePreset(themeId?: string): Preset {
  const preset = themeId ? PRESET_BY_ID[themeId] : undefined;
  return preset ?? PRESET_BY_ID[DEFAULT_THEME_ID];
}

export async function fetchPublicProfile(
  username: string,
): Promise<{ profile: PublicProfile; links: PublicLink[] } | null> {
  await dbConnect();

  const profile = await Profile.findOne({ username }).lean();
  if (!profile) return null;

  const links = await Link.find({ profileId: profile._id, enabled: true })
    .sort({ position: 1 })
    .lean();

  return {
    profile: profile as PublicProfile,
    links: links as PublicLink[],
  };
}