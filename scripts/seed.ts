/**
 * Seed script — furnishes the demo profile so the public page looks
 * complete for the product preview video.
 *
 * Usage: npm run seed
 *
 * Idempotent: re-running resets the seeded profile and its links to the
 * seed set below. Intended for the local dev database / a staging Atlas M0
 * that backs the demo. Reads MONGODB_URI from the environment / .env.local.
 */

import "./dns-bootstrap";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { Profile, Link } from "@/lib/db/models";
import { SEEDED_USERNAME } from "@/lib/public-profile";

const PROFILE = {
  username: SEEDED_USERNAME,
  displayName: "Alex Rivera",
  bio: "Producer & DJ. New single 'Afterglow' out now. Making you dance, one kick drum at a time.",
  avatarUrl: "",
  themeId: "mono",
  socials: [
    { platform: "instagram", url: "https://instagram.com/alexrvrs" },
    { platform: "tiktok", url: "https://tiktok.com/@alexrvrs" },
    { platform: "youtube", url: "https://youtube.com/@alexrvrs" },
  ],
};

const LINKS = [
  {
    label: "Listen: Afterglow (single)",
    url: "https://open.spotify.com/artist/afterglow",
    position: 0,
    enabled: true,
  },
  {
    label: "Summer Mix 2026",
    url: "https://soundcloud.com/alexrvrs/summer-mix-2026",
    position: 1,
    enabled: true,
  },
  {
    label: "Book me for a show",
    url: "https://alexrivers.com/booking",
    position: 2,
    enabled: true,
  },
  {
    label: "Merch & Vinyl",
    url: "https://shop.alexrivers.com",
    position: 3,
    enabled: true,
  },
];

async function main() {
  await dbConnect();

  const profile = await Profile.findOneAndUpdate(
    { username: SEEDED_USERNAME },
    { $set: PROFILE },
    { returnDocument: "after", upsert: true, runValidators: true },
  );

  if (!profile) throw new Error("Could not seed profile.");

  await Link.deleteMany({ profileId: profile._id });
  await Link.insertMany(LINKS.map((l) => ({ ...l, profileId: profile._id })));

  const linkCount = await Link.countDocuments({ profileId: profile._id });
  console.log(
    `Seeded profile "${SEEDED_USERNAME}" (theme: ${profile.themeId}) with ${linkCount} links.`,
  );
  console.log(`Visit /${SEEDED_USERNAME} to view it.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exitCode = 1;
});
