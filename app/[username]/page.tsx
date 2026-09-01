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
      className="relative isolate flex min-h-screen flex-col overflow-hidden px-5 py-12 sm:px-8 sm:py-16"
      style={{
        ...theme.tokens,
        background: "var(--page-bg)",
        color: "var(--fg)",
        fontFamily: "var(--font-geist-sans), sans-serif",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 opacity-[0.16]"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, var(--accent), transparent 70%)",
        }}
      />

      <section
        className="mx-auto flex w-full max-w-md flex-col items-center text-center sm:max-w-lg"
        style={{ gap: 32 }}
      >
        <div
          className="animate-fade-up rounded-full"
          style={{
            background: "var(--accent)",
            padding: 3,
            boxShadow:
              "0 0 0 8px color-mix(in srgb, var(--accent) 14%, transparent), var(--card-shadow)",
          }}
        >
          <div
            className="h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
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
                className="flex h-full w-full items-center justify-center text-4xl font-semibold sm:text-5xl"
                style={{ color: "var(--accent)" }}
              >
                {initial}
              </span>
            )}
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {profile.displayName ?? username}
          </h1>
          {profile.bio ? (
            <p
              className="mx-auto mt-3 max-w-sm text-sm leading-relaxed sm:max-w-md sm:text-base"
              style={{ color: "var(--muted)" }}
            >
              {profile.bio}
            </p>
          ) : null}
        </div>

        {links.length > 0 ? (
          <ul
            className="animate-fade-up flex w-full flex-col"
            style={{
              gap: 14,
              listStyle: "none",
              margin: 0,
              padding: 0,
              animationDelay: "160ms",
            }}
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
                      className="rounded-lg object-cover"
                    />
                  ) : null}
                </TrackedLink>
              </li>
            ))}
          </ul>
        ) : null}

        {profile.socials?.length ? (
          <ul
            className="animate-fade-up flex flex-wrap items-center justify-center"
            style={{
              gap: 10,
              listStyle: "none",
              margin: 0,
              padding: 0,
              animationDelay: "240ms",
            }}
          >
            {profile.socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full py-2 pl-3 pr-4 text-sm font-medium transition duration-150 hover:-translate-y-0.5 hover:opacity-90"
                  style={{
                    color: "var(--accent-ink)",
                    background: "var(--accent)",
                    boxShadow: "var(--card-shadow)",
                  }}
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
                  />
                  {s.platform}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <p
        className="mt-auto animate-fade-in flex items-center justify-center gap-2 pt-14 text-xs font-medium tracking-wide"
        style={{ color: "var(--muted)", opacity: 0.7 }}
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        Powered by MySpace
      </p>
    </main>
  );
}
