import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { shared, colors, usePageTitle } from "../theme";
import Logo from "../components/Logo";
import PageShell from "../components/PageShell";

const GAMES = [
  {
    slug: "/ordspill",
    title: "Ordspill",
    tagline: "Finn fellesnevneren i fire kategorier blant seksten ord.",
    color: colors.accent,
    available: true,
  },
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
  return (
    <PageShell>
      <div style={shared.header}>
        <Logo />
        <h1 style={shared.title}>Fellesnevner</h1>
        <p style={shared.subtitle}>Flere spill, én fellesnevner. Velg et spill under.</p>
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
