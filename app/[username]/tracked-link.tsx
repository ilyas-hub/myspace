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
      className="group flex w-full items-center gap-3 rounded-2xl py-3 pl-3 pr-4 transition duration-200 hover:-translate-y-0.5 sm:py-4 sm:pl-4 sm:pr-4 sm:gap-4 md:py-2 md:pl-3 md:pr-4 md:gap-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        color: "var(--fg)",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {children ? (
        <span
          className="shrink-0 overflow-hidden rounded-xl transition duration-200 group-hover:scale-[1.04]"
          style={{ background: "var(--page-bg)" }}
        >
          {children}
        </span>
      ) : (
        <span
          aria-hidden
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition duration-200 group-hover:scale-[1.06]"
          style={{
            background:
              "color-mix(in srgb, var(--accent) 12%, transparent)",
            color: "var(--accent)",
          }}
        >
          {label.slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="min-w-0 flex-1 text-left text-sm font-medium sm:text-[15px]">
        {label}
      </span>
      <span
        aria-hidden
        className="w-6 shrink-0 text-right text-base opacity-40 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
        style={{ color: "var(--accent)" }}
      >
        {"\u2192"}
      </span>
    </a>
  );
}
