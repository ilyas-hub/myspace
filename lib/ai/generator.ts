export const AI_MODEL = "gemini-3.5-flash-lite";

export type AiMode = "bio" | "links";

export interface LinkSeed {
  label?: string;
  url: string;
}

export interface Caption {
  label: string;
  caption: string;
}

// ── Input normalization ─────────────────────────────────────────
// The AI generator accepts human-typed input. Normalize it so the
// route handler only ever hands the prompt-builder well-formed data.

export function normalizeKeywords(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((k): k is string => typeof k === "string")
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
}

export function normalizeLinks(value: unknown): LinkSeed[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((l): l is Record<string, unknown> => !!l && typeof l === "object")
    .filter(
      (l) => typeof l.url === "string" && (l.url as string).trim().length > 0,
    )
    .map((l) => ({
      url: (l.url as string).trim(),
      label:
        typeof l.label === "string" && (l.label as string).trim().length > 0
          ? (l.label as string).trim()
          : undefined,
    }));
}

// ── Prompt building ─────────────────────────────────────────────

export function buildBioPrompt(keywords: string[]): string {
  const list = keywords.filter(Boolean).join(", ") || "a first-person creator";
  return [
    "You are a creative copywriter for a link-in-bio profile page.",
    `Write a short, warm, first-person bio (2-3 sentences, roughly 35-55 words) for the creator based on these keywords: ${list}.`,
    "Do not recite the keywords as a list and do not use hashtags.",
    "Do not use markdown, quotes, or labels. Return ONLY the bio text.",
  ].join("\n");
}

export function buildLinksPrompt(links: LinkSeed[]): string {
  const list = links
    .map((link, i) => `${i + 1}. ${link.label ?? link.url}`)
    .join("\n");
  return [
    "You are a creative copywriter for a link-in-bio profile page.",
    "Write ONE short, click-worthy caption (1-6 words) for each link below. Keep captions distinct and specific to what each link likely is.",
    "Links:",
    list,
    'Respond with ONLY a JSON object in this exact shape (one entry per link, keyed by number):',
    '{"captions":[{"index":1,"caption":"..."},{"index":2,"caption":"..."}]}',
    "Return ONLY the JSON. No markdown fences, no extra text.",
  ].join("\n");
}

// ── Response parsing ────────────────────────────────────────────

function extractFirstJsonObject(text: string): Record<string, unknown> | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = candidate.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice) as unknown;
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function parseBioResponse(text: string): string {
  return (text ?? "").trim();
}

export function parseLinksResponse(
  text: string,
  links: LinkSeed[],
): Caption[] {
  const json = extractFirstJsonObject(text ?? "");
  if (!json) return [];
  const captions = json.captions;
  if (!Array.isArray(captions)) return [];

  const byIndex = new Map<number, string>();
  for (const c of captions) {
    if (
      c &&
      typeof c === "object" &&
      typeof (c as Record<string, unknown>).index === "number" &&
      typeof (c as Record<string, unknown>).caption === "string"
    ) {
      byIndex.set(
        (c as Record<string, unknown>).index as number,
        ((c as Record<string, unknown>).caption as string).trim(),
      );
    }
  }

  // Guarantee exactly one caption per input link. Prefer the model's
  // caption for a link; fall back to the label so the UI never shows a
  // silently-truncated or mis-ordered set.
  return links.map((seed, i) => {
    const index = i + 1;
    const provided = byIndex.get(index);
    return {
      label: seed.label ?? `Link ${index}`,
      caption: provided && provided.length > 0 ? provided : seed.label ?? `Link ${index}`,
    };
  });
}

// The Gemini SDK is intentionally NOT imported at module scope. This file is
// fetched by app/api/ai/route.ts at request-module load time; a static
// `import { google } from "@ai-sdk/google"` would put the whole SDK (zod,
// provider-utils, etc.) on the cold-start import path. If that package graph
// fails to evaluate on a given runtime, the route module would die at load —
// before POST or any of our logging ever runs (the "0 external requests, too
// fast, nothing in the logs" symptom). Instead the SDK is loaded lazily, per
// call, inside the try/catch below so any failure is caught and logged.

export async function generateBio(keywords: string[]): Promise<string> {
  let text: string;
  try {
    const [{ generateText }, { createGoogle }] = await Promise.all([
      import("ai"),
      import("@ai-sdk/google"),
    ]);
    const provider = createGoogle({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const model = provider(AI_MODEL);
    ({ text } = await generateText({
      model,
      prompt: buildBioPrompt(keywords),
    }));
  } catch (err) {
    console.error("[ai] generateBio failed (init or call):", err);
    throw err;
  }

  const bio = parseBioResponse(text);
  if (!bio) throw new Error("AI returned an empty bio.");
  return bio;
}

export async function generateLinkCaptions(links: LinkSeed[]): Promise<Caption[]> {
  let text: string;
  try {
    const [{ generateText }, { createGoogle }] = await Promise.all([
      import("ai"),
      import("@ai-sdk/google"),
    ]);
    const provider = createGoogle({
      apiKey: process.env.GEMINI_API_KEY,
    });
    const model = provider(AI_MODEL);
    ({ text } = await generateText({
      model,
      prompt: buildLinksPrompt(links),
    }));
  } catch (err) {
    console.error("[ai] generateLinkCaptions failed (init or call):", err);
    throw err;
  }

  const captions = parseLinksResponse(text, links);
  if (captions.length === 0) {
    throw new Error("AI returned no link captions.");
  }
  return captions;
}
