"use client";

import { useEffect, useState } from "react";
import { ProfileEditor, type ProfileDraft } from "./profile-editor";
import { LinksManager, type LinkItem } from "./links-manager";
import { AiGenerator } from "./ai-generator";
import { adminFetch } from "./admin-helpers";

export function AdminDashboard() {
  const [profile, setProfile] = useState<ProfileDraft | null | undefined>(undefined);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await adminFetch("/api/profile");
      if (cancelled) return;
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Failed to load profile.");
        return;
      }
      setProfile(data);
      setProfileId(data?._id ?? null);
      if (!data?._id) return;
      const linksRes = await adminFetch(`/api/links?profileId=${data._id}`);
      if (cancelled) return;
      if (linksRes.ok) {
        setLinks(await linksRes.json());
      } else {
        setError("Failed to load links.");
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSaved(saved: ProfileDraft) {
    setProfile(saved);
    setProfileId(saved._id ?? profileId);
    setError(null);
  }

  async function handleLinkedChanged() {
    setError(null);
    if (!profileId) return;
    const res = await adminFetch(`/api/links?profileId=${profileId}`);
    if (res.ok) setLinks(await res.json());
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div
          role="alert"
          className="animate-fade-in flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span
            aria-hidden
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500"
          />
          {error}
        </div>
      ) : null}

      {profile === undefined ? (
        <div className="admin-card animate-pulse p-6">
          <div className="h-4 w-24 rounded bg-zinc-200" />
          <div className="mt-5 space-y-3">
            <div className="h-9 rounded-lg bg-zinc-100" />
            <div className="h-9 rounded-lg bg-zinc-100" />
            <div className="h-9 rounded-lg bg-zinc-100" />
          </div>
          <p className="sr-only">Loading dashboard…</p>
        </div>
      ) : (
        <>
          <ProfileEditor profile={profile} onSaved={handleSaved} onError={setError} />
          {profile && profileId ? (
            <LinksManager
              profileId={profileId}
              links={links}
              onLinkedChanged={handleLinkedChanged}
              onError={setError}
            />
          ) : null}
          {profile && profileId ? (
            <AiGenerator links={links} onError={setError} />
          ) : null}
        </>
      )}
    </div>
  );
}
