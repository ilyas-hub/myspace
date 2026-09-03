# MySpace  link-in-bio demo

A personalized link-in-bio tool for creators. Single-admin, deployable on
Vercel's free tier (Hobby) with MongoDB Atlas M0, Vercel Blob, and the Google
Gemini free tier. Ships as a working demo plus a product preview video.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind v4)
- Mongoose + MongoDB Atlas M0
- Vercel Blob (avatar / link thumbnails)
- Vercel AI SDK + Google Gemini (`/api/ai` bio & link-caption generator)

## Get started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the values (see below).
3. Furnish the demo profile with seed content:

   ```bash
   npm run seed
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000` (redirects to `/alex`), and manage the
   profile at `/admin`.

## Scripts

| Command            | Purpose                                            |
| ------------------ | -------------------------------------------------- |
| `npm run dev`      | Start the dev server                               |
| `npm run build`    | Production build                                   |
| `npm run start`    | Serve a production build                           |
| `npm run lint`     | ESLint                                             |
| `npm run typecheck`| TypeScript type check                              |
| `npm test`         | Vitest unit/integration tests                      |
| `npm run seed`     | Seed/furnish the `alex` demo profile               |

## Environment variables

All server-only; set them in `.env.local` for local dev and in the Vercel
project for deploys.

| Variable               | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `MONGODB_URI`          | MongoDB Atlas M0 connection string (db `myspace`) |
| `ADMIN_SECRET`         | Secret for the `/admin` gate              |
| `BLOB_READ_WRITE_TOKEN`| Vercel Blob token for image uploads       |
| `GEMINI_API_KEY`       | Google AI Studio key for `/api/ai`        |

## Demo flow

`/` redirects to the seeded `/alex` profile → the themed profile shows the
creator's avatar, bio, links, and socials. Clicking a link records a Click and
leaves to the destination. The admin surface (`/admin`, gated by
`ADMIN_SECRET`) edits profile/link data, picks a theme, uploads images, and
generates AI bio/link copy.

## Tests

Vitest tests cover the route-handler seams and the AI generator logic:

```bash
npm test                 # full suite
npx vitest run <file>    # a single test file
```
