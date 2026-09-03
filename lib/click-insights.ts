export interface ClickableLink {
  _id: string;
  label: string;
  clickCount: number;
}

interface LinkSummary {
  topLabel: string;
  total: number;
  countWithClicks: number;
  topHasUnambiguousLead: boolean;
}

function summarize(links: ClickableLink[]): LinkSummary | null {
  if (links.length === 0) return null;

  const total = links.reduce((sum, l) => sum + l.clickCount, 0);
  if (total === 0) return null;

  const top = links.reduce((best, l) =>
    l.clickCount > best.clickCount ? l : best,
  );
  const countWithClicks = links.filter((l) => l.clickCount > 0).length;

  const others = links.filter((l) => l !== top);
  const topHasUnambiguousLead =
    others.length === 0 || top.clickCount > Math.max(...others.map((l) => l.clickCount));

  return {
    topLabel: top.label,
    total,
    countWithClicks,
    topHasUnambiguousLead,
  };
}

export function interpretClicks(links: ClickableLink[]): string | null {
  const summary = summarize(links);
  if (!summary) return null;

  if (summary.countWithClicks <= 1 || !summary.topHasUnambiguousLead) {
    return `Most clicks went to ${summary.topLabel}.`;
  }

  return `Most clicks went to ${summary.topLabel} (${summary.total} total clicks across ${summary.countWithClicks} links).`;
}

export function buildInsightCta(links: ClickableLink[]): string | null {
  const summary = summarize(links);
  if (!summary) return null;

  return `Most clicks go to ${summary.topLabel}  consider featuring it higher.`;
}
