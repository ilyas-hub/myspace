"use client";

import { useState } from "react";
import { adminFetch } from "./admin-helpers";
import type { LinkItem } from "./links-manager";

interface Props {
  links: LinkItem[];
  onError: (message: string) => void;
}

interface CaptionResult {
  label: string;
  caption: string;
}

export function AiGenerator({ links, onError }: Props) {
  const [keywords, setKeywords] = useState("");
  const [bio, setBio] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionResult[] | null>(null);
  const [busy, setBusy] = useState<"bio" | "links" | null>(null);
  const [copied, setCopied] = useState(false);

  async function generateBio() {
    const list = keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    if (list.length === 0) {
      onError("Enter at least one keyword to generate a bio.");
      return;
    }
    setBusy("bio");
    setBio(null);
    try {
      const res = await adminFetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({ mode: "bio", keywords: list }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Bio generation failed.");
        return;
      }
      setBio(data.bio);
    } catch {
      onError("Network error while generating a bio.");
    } finally {
      setBusy(null);
    }
  }

  async function generateCaptions() {
    if (links.length === 0) {
      onError("Add at least one link before generating captions.");
      return;
    }
    setBusy("links");
    setCaptions(null);
    try {
      const res = await adminFetch("/api/ai", {
        method: "POST",
        body: JSON.stringify({
          mode: "links",
          links: links.map((l) => ({ label: l.label, url: l.url })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Caption generation failed.");
        return;
      }
      setCaptions(data.captions);
    } catch {
      onError("Network error while generating captions.");
    } finally {
      setBusy(null);
    }
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const copyLabel = copied ? "Copied \u2713" : "Copy";

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        AI copywriter
      </h2>
      <p className="mt-1 text-xs text-zinc-400">
        Generate a short bio from a few keywords, or click-worthy captions for
        your links.
      </p>

      <div className="mt-5 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Generate a bio
          </label>
          <input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g. music, producer, vinyl"
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={generateBio}
              disabled={busy !== null}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              {busy === "bio" ? "Generating\u2026" : "Generate bio"}
            </button>
            {bio ? (
              <>
                <button
                  type="button"
                  onClick={() => copy(bio)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  {copyLabel}
                </button>
                <button
                  type="button"
                  onClick={() => setBio(null)}
                  className="text-sm text-zinc-500 hover:underline"
                >
                  Clear
                </button>
              </>
            ) : null}
          </div>
          {bio ? (
            <p className="mt-3 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
              {bio}
            </p>
          ) : null}
        </div>

        <div className="border-t border-zinc-100 pt-5">
          <label className="block text-sm font-medium text-zinc-700">
            Generate captions for your links
          </label>
          <p className="mt-1 text-xs text-zinc-400">
            {links.length === 0
              ? "Add links above to caption them."
              : `${links.length} link${links.length === 1 ? "" : "s"} ready.`}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={generateCaptions}
              disabled={busy !== null || links.length === 0}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {busy === "links" ? "Generating\u2026" : "Generate captions"}
            </button>
            {captions ? (
              <button
                type="button"
                onClick={() =>
                  copy(
                    captions
                      .map((c) => `${c.label}: ${c.caption}`)
                      .join("\n"),
                  )
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                {copyLabel}
              </button>
            ) : null}
          </div>
          {captions ? (
            <ul className="mt-3 space-y-2">
              {captions.map((c, i) => (
                <li
                  key={i}
                  className="flex items-baseline gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-sm"
                >
                  <span className="w-40 shrink-0 truncate font-medium text-zinc-900">
                    {c.label}
                  </span>
                  <span className="text-zinc-700">{c.caption}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}
