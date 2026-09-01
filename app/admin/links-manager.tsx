"use client";

import { useState } from "react";
import { adminFetch } from "./admin-helpers";

export interface LinkItem {
  _id: string;
  url: string;
  label: string;
  thumbnailUrl?: string;
  position: number;
  enabled: boolean;
  clickCount?: number;
}

interface Props {
  profileId: string;
  links: LinkItem[];
  onLinkedChanged: () => void;
  onError: (message: string) => void;
}

export function LinksManager({ profileId, links, onLinkedChanged, onError }: Props) {
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function api(path: string, init: RequestInit) {
    const res = await adminFetch(path, init);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Request failed.");
    return data;
  }

  async function addLink() {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setBusy(true);
    try {
      await api("/api/links", {
        method: "POST",
        body: JSON.stringify({
          profileId,
          url: newUrl.trim(),
          label: newLabel.trim(),
          position: links.length,
        }),
      });
      setNewLabel("");
      setNewUrl("");
      onLinkedChanged();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteLink(id: string) {
    if (!window.confirm("Delete this link?")) return;
    setBusy(true);
    try {
      await api("/api/links", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      onLinkedChanged();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function saveLink(id: string) {
    setBusy(true);
    try {
      await api("/api/links", {
        method: "PUT",
        body: JSON.stringify({ id, label: editLabel.trim(), url: editUrl.trim() }),
      });
      setEditingId(null);
      onLinkedChanged();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function moveLink(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const a = links[index];
    const b = links[target];
    setBusy(true);
    try {
      await Promise.all([
        api("/api/links", {
          method: "PUT",
          body: JSON.stringify({ id: a._id, position: b.position }),
        }),
        api("/api/links", {
          method: "PUT",
          body: JSON.stringify({ id: b._id, position: a.position }),
        }),
      ]);
      onLinkedChanged();
    } catch (err) {
      onError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const sorted = [...links].sort((a, b) => a.position - b.position);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Links
      </h2>

      <div className="mt-5 space-y-2">
        {sorted.length === 0 ? (
          <p className="text-sm text-zinc-400">No links yet. Add your first one below.</p>
        ) : (
          sorted.map((link, i) => (
            <div
              key={link._id}
              className="flex items-center gap-3 rounded-lg border border-zinc-200 px-3 py-2"
            >
              <div className="flex flex-col">
                <button
                  type="button"
                  disabled={i === 0 || busy}
                  onClick={() => moveLink(i, -1)}
                  aria-label="Move up"
                  className="text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                >
                  {"\u2191"}
                </button>
                <button
                  type="button"
                  disabled={i === sorted.length - 1 || busy}
                  onClick={() => moveLink(i, 1)}
                  aria-label="Move down"
                  className="text-zinc-400 hover:text-zinc-900 disabled:opacity-30"
                >
                  {"\u2193"}
                </button>
              </div>

              {editingId === link._id ? (
                <>
                  <input
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    placeholder="Label"
                    className="w-40 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                  />
                  <input
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    placeholder="https://…"
                    className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => saveLink(link._id)}
                    disabled={busy}
                    className="rounded-lg bg-zinc-900 px-3 py-1 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="w-40 truncate text-sm font-medium text-zinc-900">
                    {link.label}
                  </span>
                  <span className="flex-1 truncate text-sm text-zinc-500">
                    {link.url}
                  </span>
                  <span className="text-xs text-zinc-400">{link.clickCount}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(link._id);
                      setEditLabel(link.label);
                      setEditUrl(link.url);
                    }}
                    className="text-sm text-zinc-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLink(link._id)}
                    disabled={busy}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label"
          className="w-40 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://…"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={addLink}
          disabled={busy || !newLabel.trim() || !newUrl.trim()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Add link
        </button>
      </div>
    </section>
  );
}