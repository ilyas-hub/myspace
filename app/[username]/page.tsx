import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  fetchPublicProfile,
  resolvePreset,
} from "@/lib/public-profile";
import { TrackedLink } from "./tracked-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await fetchPublicProfile(username);
  if (!data) return { title: "Profile not found" };
  return {
    title: `${data.profile.displayName ?? username} on MySpace`,
    description: data.profile.bio || `Links for ${username} on MySpace.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const data = await fetchPublicProfile(username);
  if (!data) notFound();

  const { profile, links } = data;
  const theme = resolvePreset(profile.themeId);
  const initial = (profile.displayName ?? username).slice(0, 1).toUpperCase();

  return (
    <main
      className="flex min-h-screen flex-col px-4 py-12"
      style={{
        ...theme.tokens,
        background: "var(--page-bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <section
        className="mx-auto flex w-full max-w-md flex-col items-center text-center"
        style={{ gap: 24 }}
      >
        <div
          className="flex h-28 w-28 items-center justify-center overflow-hidden ring-2"
          style={{
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={`${profile.displayName ?? username} avatar`}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="text-4xl font-semibold"
              style={{ color: "var(--muted)" }}
            >
              {initial}
            </span>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold">
            {profile.displayName ?? username}
          </h1>
          {profile.bio ? (
            <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: "var(--muted)" }}>
              {profile.bio}
            </p>
          ) : null}
        </div>

        <ul
          className="flex flex-col"
          style={{ gap: 12, width: "100%", listStyle: "none", margin: 0, padding: 0 }}
        >
          {links.map((link) => (
            <li key={String(link._id)} style={{ width: "100%" }}>
              <TrackedLink
                linkId={String(link._id)}
                url={link.url}
                label={link.label}
              >
                {link.thumbnailUrl ? (
                  <Image
                    src={link.thumbnailUrl}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                ) : null}
              </TrackedLink>
            </li>
          ))}
        </ul>

        {profile.socials?.length ? (
          <ul
            className="flex flex-wrap items-center justify-center"
            style={{ gap: 16, listStyle: "none", margin: 0, padding: 0 }}
          >
            {profile.socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition hover:opacity-80"
                  style={{
                    color: "var(--accent-ink)",
                    background: "var(--accent)",
                    borderRadius: "999px",
                    padding: "6px 14px",
                  }}
                >
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p
        className="mt-auto pt-12 text-center text-xs"
        style={{ color: "var(--muted)", opacity: 0.7 }}
      >
        Powered by MySpace
      </p>
    </main>
  );
}