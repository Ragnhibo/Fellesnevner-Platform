import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trophy, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import Logo from "../components/Logo";
import PageShell from "../components/PageShell";

const GAMES = [
  {
    slug: "/ordspill",
    title: "Ordspill",
    tagline: "Finn fellesnevneren i fire kategorier blant seksten ord.",
    color: colors.accent,
    category: "Ord",
    available: true,
  },
  {
    slug: "/ordjakt",
    title: "Ordjakt",
    tagline: "Gjett det norske ordet på fem bokstaver — seks forsøk.",
    color: colors.mint,
    category: "Ord",
    available: true,
  },
  {
    slug: "/kryptojakt",
    title: "Kryptojakt",
    tagline: "Kryptiske hint — anagram og skjulte ord.",
    color: colors.mint,
    category: "Ord",
    available: true,
  },
  {
    slug: "/hovedstadsjakt",
    title: "Hovedstadsjakt",
    tagline: "Gjett verdens hovedsteder — lær mens du spiller.",
    color: colors.pink,
    category: "Geografi",
    available: true,
  },
  {
    slug: "/bokstavjakt",
    title: "Bokstavjakt",
    tagline: "Finn så mange land og hovedsteder du kan på tid.",
    color: colors.accent,
    category: "Geografi",
    available: true,
  },
  {
    slug: "/delstatsjakt",
    title: "Delstatsjakt",
    tagline: "Lær USAs 50 delstater, hovedsteder og plassering.",
    color: colors.mint,
    category: "Geografi",
    available: true,
  },
  {
    slug: "/flaggjakt",
    title: "Flaggjakt",
    tagline: "Gjett landet ut fra flagget.",
    color: colors.pink,
    category: "Geografi",
    available: true,
  },
  {
    slug: "/norgesjakt",
    title: "Norgesjakt",
    tagline: "Fylker og norgesfakta.",
    color: colors.mint,
    category: "Geografi",
    isNew: true,
    available: true,
  },
  {
    slug: "/kodejakt",
    title: "Kodejakt",
    tagline: "Knekk fargekoden — logikk, ikke flaks.",
    color: colors.blue,
    category: "Tall & logikk",
    available: true,
  },
  {
    slug: "/regnejakt",
    title: "Regnejakt",
    tagline: "Løs så mange regnestykker du kan på 60 sekunder.",
    color: colors.blue,
    category: "Tall & logikk",
    available: true,
  },
  {
    slug: "/sekvensjakt",
    title: "Sekvensjakt",
    tagline: "Finn neste tall i rekken.",
    color: colors.accent,
    category: "Tall & logikk",
    available: true,
  },
  {
    slug: "/vinjakt",
    title: "Vinjakt",
    tagline: "Vinregioner, druer og vinord.",
    color: colors.pink,
    category: "Allmennkunnskap",
    isNew: true,
    available: true,
  },
  {
    slug: "/arstallsjakt",
    title: "Årstallsjakt",
    tagline: "Gjett årstall og sorter hendelser kronologisk.",
    color: colors.blue,
    category: "Allmennkunnskap",
    isNew: true,
    available: true,
  },
];

const CATEGORY_ORDER = ["Ord", "Geografi", "Tall & logikk", "Allmennkunnskap"];

function GameCard({ game }) {
  const content = (
    <>
      {game.isNew && <div style={styles.newBadge}>Nytt</div>}
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

      {CATEGORY_ORDER.map((cat) => {
        const gamesInCat = GAMES.filter((g) => g.category === cat);
        if (gamesInCat.length === 0) return null;
        return (
          <div key={cat} style={styles.categorySection}>
            <h2 style={styles.categoryTitle}>{cat}</h2>
            <div style={styles.grid}>
              {gamesInCat.map((g) => (
                <GameCard key={g.title} game={g} />
              ))}
            </div>
          </div>
        );
      })}
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
  categorySection: { marginTop: 28 },
  categoryTitle: {
    fontFamily: "'Kalam', cursive",
    fontSize: 18,
    fontWeight: 700,
    color: "#B9C4B4",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: "1.5px dashed rgba(237,237,224,0.2)",
  },
  newBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(232,193,90,0.18)",
    color: "#E8C15A",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderRadius: 5,
    padding: "3px 7px",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
  },
  card: {
    display: "block",
    position: "relative",
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
