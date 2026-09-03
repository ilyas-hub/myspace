# Candidate Note  MySpace

A short, honest note from the builder about MySpace as it stands today  written
after a focused UI/UX pass over an existing working demo. This is the kind of
note I'd leave in a real codebase: what changed, why, and what I'd do
differently with more time. (The same note also lives in the product at
[/builders-note](https://myspace-sable.vercel.app/builders-note).)

## 1. Where things started

The app already had a solid foundation: a themed public profile page, a
single-admin dashboard behind a secret, a Mongoose layer, click tracking, and
an AI copy route backed by Google Gemini. The AI route was the one thing
actively broken  every `/api/ai` request returned `502` and the logs showed
`404 NOT_FOUND` from the model endpoint.

## 2. Fixing the live bug before making things pretty

The root cause was a retired model: the deployed build was calling
`gemini-2.0-flash-lite`, which Google had removed from the API. I updated the
generator (`lib/ai/generator.ts`) to `gemini-3.5-flash-lite`, committed, and
pushed so Vercel would redeploy  production was green before I touched a
pixel. Fixing production issues before cosmetic work is a default I stick to.

## 3. The UI/UX pass

Direction, decided up front: **“modern polished neutral”**  refined zinc
neutrals, one strong indigo accent, soft shadows, larger touch targets, better
spacing, clean SaaS feel. Then applied it across every page:

- **Design system in one file.** `globals.css` now carries the brand palette,
  accessible focus rings, `fade-up`/`fade-in` animations (that respect
  `prefers-reduced-motion`), and reusable utilities: `admin-card`, `field`,
  `btn-primary`, `btn-secondary`.
- **Public profile.** Avatar with an accent halo, a soft decorative glow,
  larger responsive typography, animated social pills and link cards, and
  breakpoints that reflow from phone → tablet → desktop.
- **Theme presets polished, not redrawn.** Same four theme IDs and the same
  token contract  but deeper shadows, gradient page washes, and refined radii.
  Existing profiles keep working; no stored data or schema change.
- **Admin surface.** Branded header with an `M` mark, card-based layout, a
  wider responsive container, a login card, and a skeleton loading state.
  The profile editor’s theme picker now shows **live color swatches** for each
  preset. The links manager turns wide rows into stacked cards on mobile, with
  click-count badges. The AI copywriter results got styled treatment.
- **Branded 404** for the not-found case that didn't exist before.

## 4. Craft notes and tradeoffs

- **Scope discipline.** The UI pass is visual-only  no behaviour, API, or
  data changes. The one non-visual item was deliberately undoing an
  unintended dark-mode shell removal I'd introduced mid-refactor.
- **Polish over rebuild.** The themes were enhanced in place rather than
  reimagined, so “improve design” didn't silently change what a user who chose
  *Midnight* sees.
- **Responsiveness is structural.** Every form, toolbar, and card stacks,
  wraps, or reflows rather than squeezing; interactive targets stay
  comfortable to tap.
- **Accessibility was treated as part of the design.** Keyboard focus rings,
  reduced-motion support, `aria-hidden` on decorative marks, `sr-only` text for
  the loading state.
- **Avoided a fragile Tailwind idiom.** The brand palette is *plainly-named*
  CSS variables in `:root`, aliased into Tailwind’s `--color-brand-*` namespace
  via `@theme inline`  not a self-referential mapping that only works by
  cascade luck. Verified in the compiled CSS output.
- **Deduplicated where duplication was real.** A shared `BrandMark` component
  and `btn-*` utilities replaced copy-pasted badges and button class strings.

## 5. Verification

`npm run typecheck` clean, `npm run lint` clean, `next build` green, and the
full Vitest suite passes: **95/95 tests**.

## 6. What I'd do next, given more time

- Ship a real favicon / app icon (the default Next.js one is still there) and
  an OG image per profile for richer link previews.
- E2E tests with Playwright  the unit tests cover logic seams well, but they
  never click real buttons.
- A live “preview” toggle in the admin so theme choices can be seen against
  real content before saving.
- Skeleton loaders per admin section instead of one placeholder card.
- Drag-and-drop reordering for links (native HTML5, no dependency).
- Optionally, dark-mode support across the admin that follows the OS.
