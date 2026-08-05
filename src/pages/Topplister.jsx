import React from "react";
import { Link } from "react-router-dom";
import { shared, colors, usePageTitle } from "../theme";
import PageShell from "../components/PageShell";
import { LeaderboardList } from "../components/Leaderboard";

const STANDARD_DIFF = { lett: { label: "Lett" }, middels: { label: "Middels" }, vanskelig: { label: "Vanskelig" } };
const SINGLE_TIER = { standard: { label: "Alle" } };

// One entry per game's leaderboard config — kept in sync by hand with
// each game file's own Leaderboard/SaveScoreRow props.
const BOARDS = [
  {
    slug: "/ordspill",
    title: "Ordspill",
    game: "ordspill",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    metric: "time",
  },
  {
    slug: "/ordjakt",
    title: "Ordjakt",
    game: "ordjakt",
    difficulties: SINGLE_TIER,
    initialDifficulty: "standard",
    ascending: true,
    unit: " forsøk",
  },
  {
    slug: "/kodejakt",
    title: "Kodejakt",
    game: "kodejakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: true,
    unit: " forsøk",
  },
  {
    slug: "/hovedstadsjakt",
    title: "Hovedstadsjakt",
    game: "hovedstadsjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/bokstavjakt",
    title: "Bokstavjakt",
    game: "bokstavjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " funnet",
    showTime: true,
  },
  {
    slug: "/delstatsjakt",
    title: "Delstatsjakt",
    game: "delstatsjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/regnejakt",
    title: "Regnejakt",
    game: "regnejakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " poeng",
  },
  {
    slug: "/flaggjakt",
    title: "Flaggjakt",
    game: "flaggjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/sekvensjakt",
    title: "Sekvensjakt",
    game: "sekvensjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/kryptojakt",
    title: "Kryptojakt",
    game: "kryptojakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/vinjakt",
    title: "Vinjakt",
    game: "vinjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/norgesjakt",
    title: "Norgesjakt",
    game: "norgesjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
  {
    slug: "/arstallsjakt",
    title: "Årstallsjakt",
    game: "arstallsjakt",
    difficulties: STANDARD_DIFF,
    initialDifficulty: "middels",
    ascending: false,
    unit: " riktige",
    showTime: true,
  },
];

export default function Topplister() {
  usePageTitle("Topplister");

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Topplister</h1>
        <p style={shared.subtitle}>Beste resultater for alle spillene, samlet på ett sted.</p>
      </div>

      <div style={styles.boardGrid}>
        {BOARDS.map((b) => (
          <div key={b.game} style={styles.boardCard}>
            <div style={styles.boardHeader}>
              <h2 style={styles.boardTitle}>{b.title}</h2>
              <Link to={b.slug} style={styles.playLink}>
                Spill →
              </Link>
            </div>
            <LeaderboardList
              game={b.game}
              difficulties={b.difficulties}
              initialDifficulty={b.initialDifficulty}
              ascending={b.ascending}
              unit={b.unit}
              showTime={b.showTime}
              metric={b.metric}
            />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

const styles = {
  backLink: {
    display: "inline-block",
    color: "#8FA089",
    fontSize: 12.5,
    fontFamily: "'IBM Plex Sans', sans-serif",
    textDecoration: "none",
    marginBottom: 10,
  },
  boardGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 480,
    margin: "0 auto",
  },
  boardCard: {
    border: "2px dashed rgba(237,237,224,0.3)",
    borderRadius: 10,
    padding: "16px",
  },
  boardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  boardTitle: { fontFamily: "'Kalam', cursive", fontSize: 19, fontWeight: 700, color: "#EDEDE0", margin: 0 },
  playLink: {
    color: colors.accent,
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    textDecoration: "none",
  },
};
