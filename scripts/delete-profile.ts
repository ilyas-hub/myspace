/**
 * One-off cleanup — deletes a profile by username together with all of its
 * links and clicks (a safe cascade), so a profile with a wrong/unsaved
 * username can be removed and the demo re-seeded correctly.
 *
 * Usage:
 *   npm run delete-profile -- <username>
 *   e.g.  npm run delete-profile -- "Mohd Ilyas Shaikh"
 *
 * Then recreate the intended demo profile with:
 *   npm run seed
 *
 * Idempotent outcome: running it for an unknown username does nothing harmful
 * and prints "not found".
 */

import mongoose from "mongoose";
import { dbConnect } from "@/lib/db/connect";
import { Profile, Link, Click } from "@/lib/db/models";

function parseUsername(argv: string[]): string | null {
  const dashDash = argv.indexOf("--");
  const args = dashDash === -1 ? argv.slice(2) : argv.slice(dashDash + 1);
  const value = args.find((a) => a && !a.startsWith("-"));
  return value ? value.trim() : null;
}

async function main() {
  const username = parseUsername(process.argv);
  if (!username) {
    console.error(
      "Usage: npm run delete-profile -- <username>\n  e.g. npm run delete-profile -- \"Mohd Ilyas Shaikh\"",
    );
    process.exitCode = 1;
    return;
  }

  await dbConnect();

  const profile = await Profile.findOne({ username });
  if (!profile) {
    console.log(`No profile found for username "${username}" — nothing to delete.`);
    await mongoose.disconnect();
    return;
  }

  const profileId = profile._id;

  const linkResult = await Link.deleteMany({ profileId });
  const clickResult = await Click.deleteMany({ profileId });
  await Profile.deleteOne({ _id: profile._id });

  console.log(
    `Deleted profile "${username}" (${profile.displayName ?? "no display name"}).\n` +
      `  links deleted:  ${linkResult.deletedCount}\n` +
      `  clicks deleted: ${clickResult.deletedCount}\n` +
      `Run "npm run seed" to recreate the demo profile as "alex".`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Delete failed:", err);
  process.exitCode = 1;
});
