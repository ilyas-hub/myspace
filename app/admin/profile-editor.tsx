"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ADMIN_SECRET_HEADER } from "@/lib/admin";
import { PRESETS } from "@/lib/themes";
import { validateUsername, USERNAME_ERROR_MESSAGE } from "@/lib/username";
import { adminFetch, getAdminSecret } from "./admin-helpers";

export interface ProfileDraft {
  _id?: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
  featuredImageUrl: string;
  featuredText: string;
}

interface Props {
  profile: ProfileDraft | null;
  onSaved: (profile: ProfileDraft) => void;
  onError: (message: string) => void;
}

export function ProfileEditor({ profile, onSaved, onError }: Props) {
  const [draft, setDraft] = useState<ProfileDraft>(
    profile ?? { username: "", displayName: "", bio: "", avatarUrl: "", themeId: "mono", featuredImageUrl: "", featuredText: "" },
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function validateUsernameField(): boolean {
    const error = validateUsername(draft.username.trim());
    setUsernameError(error ? USERNAME_ERROR_MESSAGE[error] : null);
    return error === null;
  }

  async function save() {
    if (!validateUsernameField()) return;
    setSaving(true);
    try {
      const res = await adminFetch("/api/profile", {
        method: profile ? "PATCH" : "POST",
        body: JSON.stringify(
          profile ? { id: profile._id, ...draft } : draft,
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Failed to save profile.");
        return;
      }
      onSaved(data);
    } catch {
      onError("Network error while saving profile.");
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        headers: { [ADMIN_SECRET_HEADER]: getAdminSecret() },
      });
      setDraft((d) => ({ ...d, avatarUrl: blob.url }));
    } catch {
      onError("Upload failed. Check the Blob store token.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="admin-card p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Profile
        </h2>
      </div>

      {profile ? (
        <p className="mt-1.5 text-xs text-zinc-400">
          Public page: /{profile.username}
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-zinc-400">
          No profile yet — create one to get a public page.
        </p>
      )}

      <div className="mt-6 space-y-5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Username</span>
          <input
            value={draft.username}
            onChange={(e) => {
              setDraft({ ...draft, username: e.target.value });
              if (usernameError) setUsernameError(null);
            }}
            onBlur={validateUsernameField}
            disabled={Boolean(profile)}
            placeholder="e.g. alex"
            className={`field mt-1.5 ${usernameError ? "!border-red-400" : ""}`}
          />
          {usernameError ? (
            <p className="mt-1.5 text-xs font-medium text-red-600">
              {usernameError}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-zinc-400">
              Used in your public URL — letters, numbers, . _ - only (no spaces).
            </p>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Display name</span>
          <input
            value={draft.displayName}
            onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
            placeholder="e.g. Alex"
            className="field mt-1.5"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Bio</span>
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            rows={3}
            placeholder="A short line about you."
            className="field mt-1.5 resize-none"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-zinc-700">Avatar</span>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center">
            {draft.avatarUrl ? (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100">
                <Image
                  src={draft.avatarUrl}
                  alt="Avatar preview"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400">
                none
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="btn-secondary px-3.5 py-2 disabled:opacity-50"
              >
                {uploading ? "Uploading\u2026" : "Upload image"}
              </button>
              {draft.avatarUrl ? (
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, avatarUrl: "" })}
                  className="text-sm font-medium text-red-600 transition hover:text-red-700"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-zinc-700">Featured content</span>
          <p className="mt-1 text-xs text-zinc-400">
            Optional image + text block shown on your public page above the links.
          </p>
          <div className="mt-3 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-zinc-600">Image URL</span>
              <input
                value={draft.featuredImageUrl}
                onChange={(e) => setDraft({ ...draft, featuredImageUrl: e.target.value })}
                placeholder="https://…"
                className="field mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-zinc-600">Caption text</span>
              <input
                value={draft.featuredText}
                onChange={(e) => setDraft({ ...draft, featuredText: e.target.value })}
                placeholder="e.g. Check out my new single!"
                className="field mt-1"
              />
            </label>
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-zinc-700">Theme</span>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {PRESETS.map((preset) => {
              const selected = draft.themeId === preset.id;
              return (
                <label
                  key={preset.id}
                  className={`group flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected
                      ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-100"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
                  }`}
                >
                  <input
                    type="radio"
                    name="themeId"
                    value={preset.id}
                    checked={selected}
                    onChange={() => setDraft({ ...draft, themeId: preset.id })}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className="flex h-12 w-16 shrink-0 items-center gap-1.5 rounded-lg border p-2 transition group-hover:scale-[1.03]"
                    style={{
                      background: preset.tokens["--page-bg"],
                      borderColor: preset.tokens["--border"],
                    }}
                  >
                    <span
                      className="h-6 w-6 shrink-0 rounded-full"
                      style={{
                        background: preset.tokens["--surface"],
                        border: `1px solid ${preset.tokens["--border"]}`,
                      }}
                    />
                    <span
                      className="h-2 w-4 rounded-full"
                      style={{ background: preset.tokens["--accent"] }}
                    />
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block truncate text-sm font-medium ${
                        selected ? "text-brand-900" : "text-zinc-900"
                      }`}
                    >
                      {preset.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-zinc-500">
                      {preset.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-zinc-100 pt-5">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary px-5 py-2.5 disabled:opacity-50"
          >
            {saving ? "Saving\u2026" : profile ? "Save profile" : "Create profile"}
          </button>
        </div>
      </div>
    </section>
  );
}
