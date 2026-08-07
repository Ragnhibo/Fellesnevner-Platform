// A deliberately small, conservative blocklist for the nickname field on
// public leaderboards. This runs in the browser, so it's a courtesy
// filter for normal use (typos, casual attempts) — not a security
// boundary. Someone who really wants to bypass it by calling the
// Supabase API directly can, same as with any client-side check. Keep
// this list short and clearly-bad rather than trying to catch every
// possible variant; false positives on innocent names are worse than
// missing a rare bypass.
const BLOCKED_SUBSTRINGS = [
  "faen",
  "helvete",
  "jævla",
  "jaevla",
  "kukk",
  "fitte",
  "hore",
  "neger",
  "homo",
  "fuck",
  "shit",
  "bitch",
  "nigger",
  "nigga",
  "cunt",
  "rape",
  "voldtekt",
];

export function containsBlockedWord(text) {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents so "jævla"/"jaevla" both match
  return BLOCKED_SUBSTRINGS.some((word) => normalized.includes(word));
}
