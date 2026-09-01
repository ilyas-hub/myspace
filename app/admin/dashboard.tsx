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
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {profile === undefined ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-400">
          Loading dashboard…
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