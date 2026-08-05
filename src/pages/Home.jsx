import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import Logo from "../components/Logo";
import PageShell from "../components/PageShell";

const GAMES = [
  {
    slug: "/ordjakt",
    title: "Ordjakt",
    tagline: "Gjett det norske ordet på fem bokstaver — seks forsøk.",
    color: colors.mint,
    available: true,
  },
  {
    slug: "/kodejakt",
    title: "Kodejakt",
    tagline: "Knekk fargekoden — logikk, ikke flaks.",
    color: colors.blue,
    available: true,
  },
  {
    slug: "/hovedstadsjakt",
    title: "Hovedstadsjakt",
    tagline: "Gjett verdens hovedsteder — lær mens du spiller.",
    color: colors.pink,
    available: true,
  },
  {
    slug: "/bokstavjakt",
    title: "Bokstavjakt",
    tagline: "Finn så mange land og hovedsteder du kan på tid.",
    color: colors.accent,
    available: true,
  },
  {
    slug: "/delstatsjakt",
    title: "Delstatsjakt",
    tagline: "Lær USAs 50 delstater, hovedsteder og plassering.",
    color: colors.mint,
    available: true,
  },
  {
    slug: "/regnejakt",
    title: "Regnejakt",
    tagline: "Løs så mange regnestykker du kan på 60 sekunder.",
    color: colors.blue,
    available: true,
  },
  {
    slug: "/flaggjakt",
    title: "Flaggjakt",
    tagline: "Gjett landet ut fra flagget.",
    color: colors.pink,
    available: true,
  },
  {
    slug: "/sekvensjakt",
    title: "Sekvensjakt",
    tagline: "Finn neste tall i rekken.",
    color: colors.accent,
    available: true,
  },
  {
    slug: "/kryptojakt",
    title: "Kryptojakt",
    tagline: "Kryptiske hint — anagram og skjulte ord.",
    color: colors.mint,
    available: true,
  },
  {
    slug: "/vinjakt",
    title: "Vinjakt",
    tagline: "Vinregioner, druer og vinord.",
    color: colors.pink,
    available: true,
  },
  {
    slug: "/norgesjakt",
    title: "Norgesjakt",
    tagline: "Fylker og norgesfakta.",
    color: colors.mint,
    available: true,
  },
  {
    slug: "/arstallsjakt",
    title: "Årstallsjakt",
    tagline: "Gjett årstall og sorter hendelser kronologisk.",
    color: colors.blue,
    available: true,
  },
  {
    slug: "/ordspill",
    title: "Ordspill",
    tagline: "Finn fellesnevneren i fire kategorier blant seksten ord.",
    color: colors.accent,
    available: true,
  },
];

function GameCard({ game }) {
  const content = (
    <>
      <div style={{ ...styles.cardDot, background: game.color }} />
      <div style={styles.cardTitle}>{game.title}</div>
      <div style={styles.cardTagline}>{game.tagline}</div>
      {game.available && (
        <div style={styles.cardCta}>
          Spill <ArrowRight size={14} style={{ marginLeft: 4 }} />
        </div>
      )}
    </>
  );

  if (!game.available) {
    return <div style={{ ...styles.card, opacity: 0.5, cursor: "default" }}>{content}</div>;
  }
  return (
    <Link to={game.slug} className="rt-card" style={{ ...styles.card, textDecoration: "none" }}>
      {content}
    </Link>
  );
}

export default function Home() {
  usePageTitle(null);
  const [shareCopied, setShareCopied] = useState(false);

  const shareSite = async () => {
    const text = "Prøv Fellesnevner — gratis norske nettleserspill! fellesnevner.no";
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <PageShell>
      <div style={shared.header}>
        <Logo />
        <h1 style={shared.title}>Fellesnevner</h1>
        <p style={shared.subtitle}>Flere spill, én fellesnevner. Velg et spill under.</p>
        <div style={styles.headerLinks}>
          <Link to="/topplister" style={styles.headerLink}>
            <Trophy size={14} style={{ marginRight: 5 }} /> Topplister
          </Link>
          <button style={styles.headerLinkBtn} className="rt-btn" onClick={shareSite}>
            <Share2 size={14} style={{ marginRight: 5 }} /> {shareCopied ? "Kopiert!" : "Del med venner"}
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {GAMES.map((g) => (
          <GameCard key={g.title} game={g} />
        ))}
      </div>
    </PageShell>
  );
}

const styles = {
  headerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    marginTop: 14,
    flexWrap: "wrap",
  },
  headerLink: {
    display: "inline-flex",
    alignItems: "center",
    border: "1.5px dashed rgba(237,237,224,0.4)",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: "#EDEDE0",
    textDecoration: "none",
  },
  headerLinkBtn: {
    display: "inline-flex",
    alignItems: "center",
    border: "1.5px dashed rgba(237,237,224,0.4)",
    borderRadius: 8,
    padding: "9px 16px",
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: "#EDEDE0",
    background: "transparent",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginTop: 8,
  },
  card: {
    display: "block",
    border: "2px dashed rgba(237,237,224,0.35)",
    borderRadius: "10px 7px 9px 6px",
    padding: "20px 18px",
    background: "rgba(237,237,224,0.03)",
    transition: "filter 0.15s, transform 0.15s",
  },
  cardDot: { width: 14, height: 14, borderRadius: "50%", marginBottom: 10 },
  cardTitle: {
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 20,
    color: "#EDEDE0",
    marginBottom: 6,
  },
  cardTagline: { color: "#B9C4B4", fontSize: 13, lineHeight: 1.4 },
  cardCta: {
    display: "flex",
    alignItems: "center",
    color: "#E8C15A",
    fontSize: 13,
    fontWeight: 600,
    marginTop: 12,
  },
};
