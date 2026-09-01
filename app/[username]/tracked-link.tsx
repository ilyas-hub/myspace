"use client";

export function TrackedLink({
  linkId,
  url,
  label,
  children,
}: {
  linkId: string;
  url: string;
  label: string;
  children?: React.ReactNode;
}) {
  function track() {
    void fetch("/api/clicks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ linkId }),
      keepalive: true,
    }).catch(() => {});
  }

  return (
    <a
      href={url}
      onClick={track}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 transition duration-150 hover:-translate-y-0.5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        color: "var(--fg)",
      }}
    >
      {children}
      <span className="flex-1 text-left text-sm font-medium">{label}</span>
      <span
        aria-hidden
        className="text-sm opacity-40 transition group-hover:opacity-100"
        style={{ color: "var(--accent)" }}
      >
        {"\u2192"}
      </span>
    </a>
  );
}