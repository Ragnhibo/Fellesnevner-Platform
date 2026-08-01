import { useEffect } from "react";

// Normalizes text for lenient answer comparison: lowercase, strips accents
// (so "bogota" matches "Bogotá"), strips punctuation. Used by any game
// that accepts free-text answers.
export function normalizeText(s) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9æøå ]/g, "");
}

// Copies text to the clipboard, returning true/false so callers can show
// a "Kopiert!" confirmation or a fallback message.
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (e) {
    return false;
  }
}

// Sets the browser tab title for whichever page/game is currently mounted,
// falling back to the base platform title when the component unmounts.
export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} – Fellesnevner` : "Fellesnevner";
    return () => {
      document.title = prev;
    };
  }, [title]);
}

// Shared chalkboard theme tokens — reused by the homepage and every game
// so a new game automatically looks like part of the same platform.

export const colors = {
  board: "#16221A",
  chalkWhite: "#EDEDE0",
  chalkMuted: "#B9C4B4",
  chalkDim: "#8FA089",
  wood: "#6B4A34",
  woodLight: "#8A6349",
  accent: "#E8C15A", // yellow chalk — the platform's primary accent
  mint: "#8FC98A",
  blue: "#8FB8D9",
  pink: "#D98FA0",
};

export const pageBackground =
  "radial-gradient(ellipse at 25% 15%, rgba(255,255,255,0.035), transparent 55%)," +
  "radial-gradient(ellipse at 85% 90%, rgba(255,255,255,0.025), transparent 55%)," +
  "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 28px)," +
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 28px)," +
  colors.board;

export const shared = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: pageBackground,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: 24,
    padding:
      "calc(24px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-left)) calc(28px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right))",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  sidebar: { width: 280, flexShrink: 0, position: "sticky", top: 28 },
  container: { width: "100%", maxWidth: "clamp(360px, 92vw, 620px)" },
  woodRule: {
    height: 6,
    borderRadius: 3,
    background: `linear-gradient(90deg, ${colors.wood}, ${colors.woodLight}, ${colors.wood})`,
    marginBottom: 18,
    opacity: 0.85,
  },
  header: { textAlign: "center", marginBottom: 16 },
  title: {
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: "clamp(30px, 7vw, 42px)",
    color: colors.chalkWhite,
    margin: 0,
    letterSpacing: 0.5,
  },
  subtitle: { color: colors.chalkMuted, fontSize: "clamp(12.5px, 3vw, 14.5px)", margin: "4px 0 0" },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    transition: "filter 0.15s, transform 0.05s",
    minHeight: 44,
    WebkitTapHighlightColor: "transparent",
    textDecoration: "none",
  },
  btnGhost: {
    background: "transparent",
    border: `1.5px dashed rgba(237,237,224,0.4)`,
    color: colors.chalkWhite,
    cursor: "pointer",
  },
  btnPrimary: { background: colors.accent, color: colors.board, cursor: "pointer" },
};

// The global <style> block (font imports, keyframes, hover rules) — mounted
// once at the app root so every page shares the same animation vocabulary.
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    background: ${colors.board};
    overscroll-behavior-y: none;
    touch-action: manipulation;
  }
  @keyframes shakeTile {
    0%, 100% { transform: translateX(0) rotate(var(--tilt, 0deg)); }
    20% { transform: translateX(-6px) rotate(var(--tilt, 0deg)); }
    40% { transform: translateX(6px) rotate(var(--tilt, 0deg)); }
    60% { transform: translateX(-4px) rotate(var(--tilt, 0deg)); }
    80% { transform: translateX(4px) rotate(var(--tilt, 0deg)); }
  }
  @keyframes revealIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes chalkDraw {
    from { stroke-dashoffset: 1; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes dotFadeIn {
    from { opacity: 0; transform: scale(0.4); }
    to { opacity: 1; transform: scale(1); }
  }
  .rt-logo-dot {
    opacity: 0;
    transform-origin: center;
    animation: dotFadeIn 0.4s ease forwards;
  }
  .rt-shake { animation: shakeTile 0.45s ease; }
  .rt-reveal {
    opacity: 0;
    animation: revealIn 0.3s ease forwards;
  }
  .rt-chalk-line {
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: chalkDraw 0.5s ease forwards;
  }
  .rt-tile:hover { filter: brightness(1.12); }
  .rt-btn:hover { filter: brightness(1.12); }
  .rt-btn:active { transform: translateY(1px); }
  .rt-sidebar { display: none; }
  @media (min-width: 900px) {
    .rt-sidebar { display: block; }
  }
  .rt-card:hover { filter: brightness(1.08); transform: translateY(-2px); }
`;
