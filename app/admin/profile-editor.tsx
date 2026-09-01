"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { ADMIN_SECRET_HEADER } from "@/lib/admin";
import { PRESETS } from "@/lib/themes";
import { adminFetch, getAdminSecret } from "./admin-helpers";

export interface ProfileDraft {
  _id?: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  themeId: string;
}

interface Props {
  profile: ProfileDraft | null;
  onSaved: (profile: ProfileDraft) => void;
  onError: (message: string) => void;
}

export function ProfileEditor({ profile, onSaved, onError }: Props) {
  const [draft, setDraft] = useState<ProfileDraft>(
    profile ?? { username: "", displayName: "", bio: "", avatarUrl: "", themeId: "mono" },
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function save() {
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
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Profile
      </h2>

      {profile ? (
        <p className="mt-1 text-xs text-zinc-400">
          Public page: /{profile.username}
        </p>
      ) : (
        <p className="mt-1 text-xs text-zinc-400">
          No profile yet — create one to get a public page.
        </p>
      )}

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Username</span>
          <input
            value={draft.username}
            onChange={(e) => setDraft({ ...draft, username: e.target.value })}
            disabled={Boolean(profile)}
            placeholder="e.g. alex"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 disabled:bg-zinc-50 disabled:text-zinc-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Display name</span>
          <input
            value={draft.displayName}
            onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
            placeholder="e.g. Alex"
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Bio</span>
          <textarea
            value={draft.bio}
            onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
            rows={3}
            placeholder="A short line about you."
            className="mt-1 w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500"
          />
        </label>

        <div>
          <span className="text-sm font-medium text-zinc-700">Avatar</span>
          <div className="mt-1 flex items-center gap-4">
            {draft.avatarUrl ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-full ring-1 ring-zinc-200">
                <Image
                  src={draft.avatarUrl}
                  alt="Avatar preview"
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-400">
                none
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              {uploading ? "Uploading\u2026" : "Upload image"}
            </button>
            {draft.avatarUrl ? (
              <button
                type="button"
                onClick={() => setDraft({ ...draft, avatarUrl: "" })}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-zinc-700">Theme</span>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {PRESETS.map((preset) => (
              <label
                key={preset.id}
                className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 ${
                  draft.themeId === preset.id
                    ? "border-zinc-900 bg-zinc-50"
                    : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="themeId"
                  value={preset.id}
                  checked={draft.themeId === preset.id}
                  onChange={() => setDraft({ ...draft, themeId: preset.id })}
                  className="mt-0.5"
                />
                <span>
                  <span className="block text-sm font-medium text-zinc-900">
                    {preset.name}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {preset.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {saving ? "Saving\u2026" : profile ? "Save profile" : "Create profile"}
          </button>
        </div>
      </div>
    </section>
  );
}