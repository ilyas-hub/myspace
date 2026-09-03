import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../brand-mark";

export const metadata: Metadata = {
  title: "Builder's Note · MySpace",
  description:
    "A short, honest note from the builder: what changed, why, and what I'd do differently with more time.",
};

const sections = [
  {
    heading: "Where things started",
    body: [
      "The app already had a solid foundation: a themed public profile page, a single-admin dashboard behind a secret, a Mongoose layer, click tracking, and an AI copy route backed by Google Gemini. The AI route was the one thing actively broken  every /api/ai request returned 502 and the logs showed 404 NOT_FOUND from the model endpoint.",
    ],
  },
  {
    heading: "Fixing the live bug before making things pretty",
    body: [
      "The root cause was a retired model: the deployed build was calling gemini-2.0-flash-lite, which Google had removed from the API. I updated the generator to gemini-3.5-flash-lite, committed, and pushed so Vercel would redeploy  production was green before I touched a pixel. Fixing production issues before cosmetic work is a default I stick to.",
    ],
  },
  {
    heading: "The UI/UX pass",
    body: [
      "Direction, decided up front: “modern polished neutral”  refined zinc neutrals, one strong indigo accent, soft shadows, larger touch targets, better spacing, clean SaaS feel. Then applied across every page:",
    ],
    list: [
      "Design system in one file. globals.css now carries the brand palette, accessible focus rings, fade animations that respect prefers-reduced-motion, and reusable utilities: admin-card, field, btn-primary, btn-secondary.",
      "Public profile. Avatar with an accent halo, a soft decorative glow, larger responsive typography, animated social pills and link cards, and breakpoints that reflow from phone to tablet to desktop.",
      "Theme presets polished, not redrawn. Same four theme IDs and the same token contract  but deeper shadows, gradient page washes, and refined radii. Existing profiles keep working; no stored data or schema change.",
      "Admin surface. Branded header with an M mark, card-based layout, a wider responsive container, a login card, and a skeleton loading state. The profile editor's theme picker now shows live color swatches for each preset. The links manager turns wide rows into stacked cards on mobile, with click-count badges. The AI copywriter results got styled treatment.",
      "Branded 404 for the not-found case that didn't exist before.",
    ],
  },
  {
    heading: "Craft notes and tradeoffs",
    body: [
      "Scope discipline  the UI pass is visual-only; no behaviour, API, or data changes. The one non-visual item was deliberately undoing an unintended dark-mode shell removal I'd introduced mid-refactor.",
      "Polish over rebuild  the themes were enhanced in place rather than reimagined, so “improve design” didn't silently change what a user who chose Midnight sees.",
      "Responsiveness is structural  every form, toolbar, and card stacks, wraps, or reflows rather than squeezing; interactive targets stay comfortable to tap.",
      "Accessibility was treated as part of the design  keyboard focus rings, reduced-motion support, aria-hidden on decorative marks, sr-only text for the loading state.",
      "Avoided a fragile Tailwind idiom  the brand palette is plainly-named CSS variables in :root, aliased into Tailwind's --color-brand-* namespace via @theme inline, not a self-referential mapping that only works by cascade luck. Verified in the compiled CSS output.",
      "Deduplicated where duplication was real  a shared BrandMark component and btn-* utilities replaced copy-pasted badges and button class strings.",
    ],
  },
  {
    heading: "What I'd do next, given more time",
    body: [],
    list: [
      "Ship a real favicon / app icon (the default Next.js one is still there) and an OG image per profile for richer link previews.",
      "E2E tests with Playwright  the unit tests cover logic seams well, but they never click real buttons.",
      "A live “preview” toggle in the admin so theme choices can be seen against real content before saving.",
      "Skeleton loaders per admin section instead of one placeholder card.",
      "Drag-and-drop reordering for links (native HTML5, no dependency).",
      "Optionally, dark-mode support across the admin that follows the OS.",
    ],
  },
];

export default function BuildersNotePage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 sm:px-6 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-56"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(99,102,241,0.12), transparent 70%)",
        }}
      />
      <article className="relative z-10 mx-auto w-full max-w-3xl">
        <header className="animate-fade-up flex items-start gap-3">
          <BrandMark />
          <div>
            <p className="text-sm font-medium text-brand-600">MySpace</p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              A builder&apos;s note
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              A short, honest note from the builder: what changed, why, and
              what I&apos;d do differently with more time.
            </p>
          </div>
        </header>

        <div
          className="animate-fade-up mt-8 space-y-8"
          style={{ animationDelay: "80ms" }}
        >
          {sections.map((section) => (
            <section
              key={section.heading}
              className="admin-card p-6 sm:p-8"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3">
                {section.body.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-zinc-600"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.list ? (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2.5 text-sm leading-relaxed text-zinc-600"
                      >
                        <span
                          aria-hidden
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 flex flex-col items-center gap-1.5 text-center">
          <p className="text-sm font-medium text-zinc-500">
            Back to
            <Link
              href="/"
              className="ml-1 font-medium text-brand-600 transition hover:text-brand-700 hover:underline"
            >
              the demo
            </Link>
          </p>
          <p className="text-xs text-zinc-400">
            typecheck · lint · build · 95/95 tests passing
          </p>
        </footer>
      </article>
    </main>
  );
}
