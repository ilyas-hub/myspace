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
    <section className="admin-card p-6 sm:p-8">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-brand-500" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Links
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-zinc-400">No links yet. Add your first one below.</p>
        ) : (
          sorted.map((link, i) => (
            <div
              key={link._id}
              className="rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 sm:p-4"
            >
              {editingId === link._id ? (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Label"
                      className="field sm:w-44"
                    />
                    <input
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="https://…"
                      className="field flex-1"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => saveLink(link._id)}
                      disabled={busy}
                      className="btn-primary px-3.5 py-1.5 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="text-sm font-medium text-zinc-500 transition hover:text-zinc-700 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        disabled={i === 0 || busy}
                        onClick={() => moveLink(i, -1)}
                        aria-label="Move up"
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-30"
                      >
                        {"\u2191"}
                      </button>
                      <button
                        type="button"
                        disabled={i === sorted.length - 1 || busy}
                        onClick={() => moveLink(i, 1)}
                        aria-label="Move down"
                        className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-30"
                      >
                        {"\u2193"}
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-zinc-900">
                          {link.label}
                        </span>
                        {link.clickCount !== undefined ? (
                          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">
                            {link.clickCount} clicks
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-zinc-500 sm:text-sm">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-3 border-t border-zinc-100 pl-9 pt-2.5 sm:pl-0 sm:text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(link._id);
                        setEditLabel(link.label);
                        setEditUrl(link.url);
                      }}
                      className="text-sm font-medium text-zinc-500 transition hover:text-zinc-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteLink(link._id)}
                      disabled={busy}
                      className="text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Label"
          className="field sm:w-44"
        />
        <input
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://…"
          className="field flex-1"
        />
        <button
          type="button"
          onClick={addLink}
          disabled={busy || !newLabel.trim() || !newUrl.trim()}
          className="btn-secondary px-4 py-2.5 disabled:opacity-50 sm:w-auto"
        >
          Add link
        </button>
      </div>
    </section>
  );
}
