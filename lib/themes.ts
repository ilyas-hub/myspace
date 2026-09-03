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
// brief (their brand may dictate colors)  presets are code data, not a DB
// collection, so adjusting them is a one-file change.
export const DEFAULT_THEME_ID = "mono";

export const PRESETS: Preset[] = [
  {
    id: "mono",
    name: "Mono · minimal light",
    description: "Clinical, editorial, modern  white, near-black ink, one sharp accent.",
    tokens: {
      "--page-bg": "linear-gradient(180deg, #fbfbfc 0%, #f3f4f6 100%)",
      "--surface": "#ffffff",
      "--fg": "#18181b",
      "--muted": "#71717a",
      "--accent": "#4f46e5",
      "--accent-ink": "#ffffff",
      "--border": "#e4e4e7",
      "--radius": "16px",
      "--card-shadow":
        "0 1px 2px rgba(24,24,27,0.05), 0 12px 32px -12px rgba(24,24,27,0.12)",
    },
  },
  {
    id: "midnight",
    name: "Midnight · dark",
    description: "Premium, techy, glow  near-black, off-white text, violet electric accent.",
    tokens: {
      "--page-bg": "linear-gradient(180deg, #0b0b11 0%, #07070b 100%)",
      "--surface": "#14151e",
      "--fg": "#f4f4f5",
      "--muted": "#a1a1aa",
      "--accent": "#a78bfa",
      "--accent-ink": "#0a0a0f",
      "--border": "#262a38",
      "--radius": "18px",
      "--card-shadow":
        "0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 30px -10px rgba(0,0,0,0.6), 0 0 24px -12px rgba(167,139,250,0.35)",
    },
  },
  {
    id: "warm",
    name: "Warm · cozy",
    description: "Friendly, organic, creamy  cream paper, brown ink, amber accent, soft corners.",
    tokens: {
      "--page-bg": "linear-gradient(180deg, #fcf6ea 0%, #f6ecdb 100%)",
      "--surface": "#fffaf0",
      "--fg": "#292524",
      "--muted": "#78716c",
      "--accent": "#d97706",
      "--accent-ink": "#ffffff",
      "--border": "#ecdfc8",
      "--radius": "22px",
      "--card-shadow":
        "0 1px 2px rgba(120,80,20,0.06), 0 14px 36px -14px rgba(120,80,20,0.16)",
    },
  },
  {
    id: "punch",
    name: "Punch · bold gradient",
    description: "Loud, energetic, branded  vivid gradient background, pill cards, white on accent.",
    tokens: {
      "--page-bg":
        "linear-gradient(155deg,#7c3aed 0%,#db2777 55%,#f59e0b 115%)",
      "--surface": "rgba(255,255,255,0.14)",
      "--fg": "#ffffff",
      "--muted": "rgba(255,255,255,0.85)",
      "--accent": "#ffffff",
      "--accent-ink": "#7c3aed",
      "--border": "rgba(255,255,255,0.3)",
      "--radius": "999px",
      "--card-shadow":
        "0 1px 0 rgba(255,255,255,0.25) inset, 0 12px 28px -10px rgba(0,0,0,0.35)",
    },
  },
];

export const PRESET_BY_ID = Object.fromEntries(
  PRESETS.map((p) => [p.id, p]),
);
