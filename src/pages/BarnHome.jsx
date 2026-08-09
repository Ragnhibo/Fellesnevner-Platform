import React from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../theme";
import { kidColors, kidShared } from "../themeKids";

const GAMES_1_3 = [
  { slug: "/barn/regning", title: "Regnejakt", emoji: "🧮", tagline: "Legg sammen og trekk fra tall", color: kidColors.sun },
  { slug: "/barn/former", title: "Formjakt", emoji: "🔷", tagline: "Kjenn igjen formene", color: kidColors.sky },
  { slug: "/barn/klokka", title: "Klokkejakt", emoji: "🕐", tagline: "Hva er klokka?", color: kidColors.tangerine },
];

export default function BarnHome() {
  usePageTitle("Fellesnevner for barn");

  return (
    <div style={kidShared.page}>
      <div style={kidShared.container}>
        <div style={kidShared.header}>
          <Link to="/" style={kidShared.backLink}>
            ← Fellesnevner
          </Link>
          <h1 style={kidShared.title}>Fellesnevner for barn 🎒</h1>
          <p style={kidShared.subtitle}>Velg klassetrinn</p>
        </div>

        <div style={styles.gradeGrid}>
          <div style={{ ...styles.gradeCard, borderColor: kidColors.sun }}>
            <div style={styles.gradeEmoji}>1️⃣2️⃣3️⃣</div>
            <h2 style={styles.gradeTitle}>1.–3. trinn</h2>
            <div style={styles.gameList}>
              {GAMES_1_3.map((g) => (
                <Link key={g.slug} to={g.slug} style={{ ...styles.gameBtn, background: g.color }}>
                  <span style={{ fontSize: 26, marginRight: 8 }}>{g.emoji}</span>
                  {g.title}
                </Link>
              ))}
            </div>
          </div>

          <div style={{ ...styles.gradeCard, opacity: 0.55 }}>
            <div style={styles.gradeEmoji}>4️⃣…7️⃣</div>
            <h2 style={styles.gradeTitle}>4.–7. trinn</h2>
            <p style={styles.comingSoon}>Kommer snart!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  gradeGrid: { display: "flex", flexDirection: "column", gap: 20 },
  gradeCard: {
    border: "4px dashed rgba(237,237,224,0.4)",
    borderRadius: 28,
    padding: "24px 20px",
    textAlign: "center",
    background: "rgba(237,237,224,0.04)",
  },
  gradeEmoji: { fontSize: 36, marginBottom: 6 },
  gradeTitle: {
    fontFamily: "'Kalam', cursive",
    fontSize: 28,
    fontWeight: 700,
    color: "#EDEDE0",
    margin: "0 0 16px",
  },
  gameList: { display: "flex", flexDirection: "column", gap: 12 },
  gameBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    padding: "18px 20px",
    fontSize: 22,
    fontWeight: 700,
    fontFamily: "'Kalam', cursive",
    color: "#16221A",
    textDecoration: "none",
    minHeight: 64,
  },
  comingSoon: { color: "#8FA089", fontFamily: "'Kalam', cursive", fontSize: 20, margin: 0 },
};
