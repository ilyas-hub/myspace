import Image from "next/image";
import Link from "next/link";
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
      className="relative isolate flex min-h-screen flex-col overflow-visible md:overflow-hidden md:h-dvh px-4 py-8 sm:px-6 sm:py-10 md:px-8"
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
        className="mx-auto flex w-full max-w-md flex-col items-center text-center sm:max-w-lg gap-5 md:gap-4"
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
            className="h-20 w-20 overflow-hidden rounded-full sm:h-24 sm:w-24 md:h-24 md:w-24"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={`${profile.displayName ?? username} avatar`}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <span
                className="flex h-full w-full items-center justify-center text-3xl font-semibold sm:text-4xl md:text-4xl"
                style={{ color: "var(--accent)" }}
              >
                {initial}
              </span>
            )}
          </div>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-3xl">
            {profile.displayName ?? username}
          </h1>
          {profile.bio ? (
            <p
              className="mx-auto mt-2 max-w-sm text-sm leading-relaxed sm:max-w-md sm:text-base"
              style={{ color: "var(--muted)" }}
            >
              {profile.bio}
            </p>
          ) : null}
        </div>

        {profile.featuredImageUrl && profile.featuredText ? (
          <div
            className="animate-fade-up w-full overflow-hidden rounded-2xl sm:max-w-md"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--card-shadow)",
              animationDelay: "120ms",
            }}
          >
            <Image
              src={profile.featuredImageUrl}
              alt={profile.featuredText}
              width={512}
              height={256}
              className="h-28 md:h-24 w-full object-cover"
            />
            <p
              className="px-3 py-2 md:px-4 md:py-3 text-sm leading-relaxed"
              style={{ color: "var(--fg)" }}
            >
              {profile.featuredText}
            </p>
          </div>
        ) : null}

        {links.length > 0 ? (
          <ul
            className="animate-fade-up flex w-full flex-col gap-3 md:gap-4"
            style={{
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
            className="animate-fade-up flex flex-wrap items-center justify-center gap-2 md:gap-2.5"
            style={{
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

      <Link
        href="/builders-note"
        className="mt-auto animate-fade-in flex items-center justify-center gap-2 pt-8 md:pt-10 text-xs font-medium tracking-wide transition hover:opacity-80"
        style={{ color: "var(--muted)", opacity: 0.7 }}
      >
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
        Powered by MySpace
      </Link>
    </main>
  );
}
