import { colors as adultColors } from "./theme";

// A playful extension of the main chalkboard theme for the /barn section.
// Keeps the same dark "tavle" background (fitting for a school theme) and
// the same fonts, but turns up brightness/roundness/size so it reads as
// clearly kid-friendly rather than just "the adult site, smaller".

export const kidColors = {
  board: adultColors.board, // keep the blackboard — it IS the school metaphor
  chalkWhite: adultColors.chalkWhite,
  chalkMuted: adultColors.chalkMuted,
  // Brighter, more saturated versions of the platform accents
  sun: "#FFC93C", // bright yellow
  grass: "#6FCF6F", // bright green
  sky: "#5AAEEE", // bright blue
  berry: "#FF7AA2", // bright pink
  tangerine: "#FF9F5A", // bright orange
};

export const kidShared = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: `radial-gradient(ellipse at 30% 10%, rgba(255,255,255,0.05), transparent 55%), ${kidColors.board}`,
    display: "flex",
    justifyContent: "center",
    padding:
      "calc(20px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-left)) calc(28px + env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right))",
    fontFamily: "'Kalam', cursive",
  },
  container: { width: "100%", maxWidth: "clamp(360px, 94vw, 560px)" },
  header: { textAlign: "center", marginBottom: 20 },
  title: {
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: "clamp(34px, 9vw, 52px)",
    color: kidColors.chalkWhite,
    margin: 0,
  },
  subtitle: {
    color: kidColors.chalkMuted,
    fontSize: "clamp(15px, 4vw, 19px)",
    margin: "6px 0 0",
    fontFamily: "'Kalam', cursive",
  },
  backLink: {
    display: "inline-block",
    color: kidColors.chalkMuted,
    fontSize: 16,
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    textDecoration: "none",
    marginBottom: 8,
  },
  card: {
    border: "4px dashed rgba(237,237,224,0.4)",
    borderRadius: 28,
    padding: "28px 20px",
    textAlign: "center",
    background: "rgba(237,237,224,0.04)",
  },
  bigBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 20,
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
    transition: "transform 0.1s, filter 0.1s",
  },
};
