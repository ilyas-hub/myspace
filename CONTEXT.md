# MySpace  domain glossary

Working vocabulary for the **MySpace** link-in-bio demo. Single-admin, single-user. All terms provisional pending Air Media's brief.

## Terms

- **Creator**  the single user of the app for the demo (no public signup; GitHub-OAuth authed admin).
- **Profile**  the creator's public page entity. Uniquely identified by `username`; lives at `/myspace/<username>`. Carries display name, bio, avatar, theme, and socials.
- **Theme**  one of a small tasteful preset set (ticket 03) referenced by `themeId` on the profile. Not a custom builder.
- **Link**  a single entry on the profile page. Has a `url`, a `label`, an optional thumbnail, and a `position`; can be `enabled`/hidden. Belongs to a profile.
- **Social**  one item in a profile's `socials` array: a `{ platform, url }` pair (e.g. instagram, youtube, tiktok).
- **Click**  an analytics event: a visit to a link, recorded as `{ profileId, linkId, timestamp }`. Drives the denormalized `clickCount` on a link.
- **Public page**  the read-only `/[username]` route rendered via React Server Components (no GET handler).
