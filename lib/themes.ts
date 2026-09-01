export type ThemeTokens = Record<string, string>;

export interface Preset {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

// Validated theme presets (theming ticket 03). A profile stores a
// `themeId`; the public page applies that preset's CSS-variable tokens.
// `mono` is the DEFAULT theme. All four are provisional pending Air Media's
// brief (their brand may dictate colors) — presets are code data, not a DB
// collection, so adjusting them is a one-file change.
export const DEFAULT_THEME_ID = "mono";

export const PRESETS: Preset[] = [
  {
    id: "mono",
    name: "Mono · minimal light",
    description: "Clinical, editorial, modern — white, near-black ink, one sharp accent.",
    tokens: {
      "--page-bg": "#fafafa",
      "--surface": "#ffffff",
      "--fg": "#18181b",
      "--muted": "#71717a",
      "--accent": "#4f46e5",
      "--accent-ink": "#ffffff",
      "--border": "#e4e4e7",
      "--radius": "12px",
      "--card-shadow": "0 1px 2px rgba(0,0,0,0.04)",
    },
  },
  {
    id: "midnight",
    name: "Midnight · dark",
    description: "Premium, techy, glow — near-black, off-white text, violet electric accent.",
    tokens: {
      "--page-bg": "#0a0a0f",
      "--surface": "#14141c",
      "--fg": "#f4f4f5",
      "--muted": "#a1a1aa",
      "--accent": "#a78bfa",
      "--accent-ink": "#0a0a0f",
      "--border": "#26262e",
      "--radius": "16px",
      "--card-shadow": "0 8px 24px rgba(0,0,0,0.35)",
    },
  },
  {
    id: "warm",
    name: "Warm · cozy",
    description: "Friendly, organic, creamy — cream paper, brown ink, amber accent, soft corners.",
    tokens: {
      "--page-bg": "#fbf5e9",
      "--surface": "#fffaf0",
      "--fg": "#292524",
      "--muted": "#78716c",
      "--accent": "#ea580c",
      "--accent-ink": "#ffffff",
      "--border": "#e7dcc8",
      "--radius": "20px",
      "--card-shadow": "0 2px 8px rgba(120,80,20,0.08)",
    },
  },
  {
    id: "punch",
    name: "Punch · bold gradient",
    description: "Loud, energetic, branded — vivid gradient background, pill cards, white on accent.",
    tokens: {
      "--page-bg":
        "linear-gradient(160deg,#7c3aed 0%,#db2777 55%,#f59e0b 110%)",
      "--surface": "rgba(255,255,255,0.14)",
      "--fg": "#ffffff",
      "--muted": "rgba(255,255,255,0.82)",
      "--accent": "#ffffff",
      "--accent-ink": "#7c3aed",
      "--border": "rgba(255,255,255,0.28)",
      "--radius": "999px",
      "--card-shadow": "0 8px 24px rgba(0,0,0,0.18)",
    },
  },
];

export const PRESET_BY_ID = Object.fromEntries(
  PRESETS.map((p) => [p.id, p]),
);
