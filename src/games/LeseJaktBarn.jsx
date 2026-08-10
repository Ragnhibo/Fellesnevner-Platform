import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { usePageTitle } from "../theme";
import { kidColors, kidShared } from "../themeKids";

const ROUND_LENGTH = 6;

// trinn1: gjenkjenn ordet — vis ord, velg riktig emoji
const WORD_TO_PICTURE = [
  { text: "KATT", emoji: "🐱" },
  { text: "HUND", emoji: "🐶" },
  { text: "SOL", emoji: "☀️" },
  { text: "BIL", emoji: "🚗" },
  { text: "FISK", emoji: "🐟" },
  { text: "EPLE", emoji: "🍎" },
  { text: "HUS", emoji: "🏠" },
  { text: "BALL", emoji: "⚽" },
];

// trinn2: kort setning — vis setning, velg riktig emoji-kombinasjon
const PHRASE_TO_PICTURE = [
  { text: "Katten sover", emoji: "😴🐱" },
  { text: "Hunden løper", emoji: "🏃🐶" },
  { text: "Jenta leser", emoji: "📖👧" },
  { text: "Fisken svømmer", emoji: "🏊🐟" },
  { text: "Gutten hopper", emoji: "🤸🧒" },
  { text: "Bjørnen sover", emoji: "😴🐻" },
  { text: "Fuglen flyr", emoji: "🐦💨" },
  { text: "Barna leker", emoji: "🧸🧒" },
];

// trinn3: fyll inn riktig ord i setningen
const CLOZE = [
  { before: "Katten", after: "melk.", answer: "drikker", options: ["drikker", "løper", "leser", "sover"] },
  { before: "Hunden", after: "i parken.", answer: "løper", options: ["løper", "spiser", "sover", "synger"] },
  { before: "Jenta", after: "en bok.", answer: "leser", options: ["leser", "spiser", "hopper", "drikker"] },
  { before: "Sola", after: "på himmelen.", answer: "skinner", options: ["skinner", "sover", "løper", "spiser"] },
  { before: "Fuglen", after: "høyt oppe.", answer: "flyr", options: ["flyr", "svømmer", "sover", "spiser"] },
  { before: "Vi", after: "pizza til middag.", answer: "spiser", options: ["spiser", "sover", "leser", "løper"] },
  { before: "Barna", after: "i skolegården.", answer: "leker", options: ["leker", "sover", "drikker", "leser"] },
  { before: "Fisken", after: "i vannet.", answer: "svømmer", options: ["svømmer", "flyr", "leser", "sover"] },
];

const LEVEL_LABEL = { trinn1: "1. trinn", trinn2: "2. trinn", trinn3: "3. trinn" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildProblem(level) {
  if (level === "trinn1") {
    const pool = WORD_TO_PICTURE;
    const entry = pool[Math.floor(Math.random() * pool.length)];
    const distractors = shuffle(pool.filter((e) => e.text !== entry.text)).slice(0, 3);
    return {
      kind: "picture",
      prompt: entry.text,
      answer: entry.emoji,
      options: shuffle([entry.emoji, ...distractors.map((d) => d.emoji)]),
    };
  }
  if (level === "trinn2") {
    const pool = PHRASE_TO_PICTURE;
    const entry = pool[Math.floor(Math.random() * pool.length)];
    const distractors = shuffle(pool.filter((e) => e.text !== entry.text)).slice(0, 3);
    return {
      kind: "picture",
      prompt: entry.text,
      answer: entry.emoji,
      options: shuffle([entry.emoji, ...distractors.map((d) => d.emoji)]),
    };
  }
  const entry = CLOZE[Math.floor(Math.random() * CLOZE.length)];
  return {
    kind: "cloze",
    before: entry.before,
    after: entry.after,
    answer: entry.answer,
    options: shuffle(entry.options),
  };
}

export default function LeseJaktBarn() {
  usePageTitle("Lesejakt for barn");
  const [level, setLevel] = useState("trinn1");
  const [qIndex, setQIndex] = useState(0);
  const [problem, setProblem] = useState(() => buildProblem("trinn1"));
  const [feedback, setFeedback] = useState(null);
  const [wrongPick, setWrongPick] = useState(null);
  const [stars, setStars] = useState(0);
  const [status, setStatus] = useState("playing");

  const changeLevel = (lvl) => {
    setLevel(lvl);
    setQIndex(0);
    setProblem(buildProblem(lvl));
    setFeedback(null);
    setWrongPick(null);
    setStars(0);
    setStatus("playing");
  };

  const startOver = useCallback(() => changeLevel(level), [level]);

  const pick = (opt) => {
    if (feedback === "correct") return;
    if (opt === problem.answer) {
      setFeedback("correct");
      setStars((s) => s + 1);
      setTimeout(() => {
        setFeedback(null);
        setWrongPick(null);
        if (qIndex + 1 >= ROUND_LENGTH) {
          setStatus("done");
        } else {
          setQIndex((i) => i + 1);
          setProblem(buildProblem(level));
        }
      }, 1000);
    } else {
      setFeedback("wrong");
      setWrongPick(opt);
      setTimeout(() => {
        setFeedback(null);
        setWrongPick(null);
      }, 600);
    }
  };

  return (
    <div style={kidShared.page}>
      <div style={kidShared.container}>
        <div style={kidShared.header}>
          <Link to="/barn" style={kidShared.backLink}>
            ← Fellesnevner for barn
          </Link>
          <h1 style={kidShared.title}>Lesejakt 📖</h1>
          <p style={kidShared.subtitle}>Les og finn riktig svar!</p>
        </div>

        <div style={styles.levelRow}>
          {Object.entries(LEVEL_LABEL).map(([key, label]) => (
            <button
              key={key}
              onClick={() => changeLevel(key)}
              style={{
                ...styles.levelBtn,
                background: level === key ? kidColors.berry : "transparent",
                color: level === key ? "#16221A" : "#EDEDE0",
                borderColor: level === key ? kidColors.berry : "rgba(237,237,224,0.4)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.starsRow}>
          {Array.from({ length: ROUND_LENGTH }).map((_, i) => (
            <span key={i} style={{ fontSize: 22, opacity: i < stars ? 1 : 0.25 }}>
              ⭐
            </span>
          ))}
        </div>

        {status === "playing" && (
          <div style={kidShared.card}>
            {problem.kind === "picture" && (
              <>
                <p style={styles.prompt}>{problem.prompt}</p>
                <div style={styles.emojiGrid}>
                  {problem.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => pick(opt)}
                      style={{
                        ...styles.emojiBtn,
                        borderColor:
                          feedback === "wrong" && wrongPick === opt
                            ? kidColors.berry
                            : feedback === "correct" && opt === problem.answer
                            ? kidColors.grass
                            : "rgba(237,237,224,0.3)",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {problem.kind === "cloze" && (
              <>
                <p style={styles.prompt}>
                  {problem.before}{" "}
                  <span style={{ color: kidColors.sun }}>
                    {feedback === "correct" ? problem.answer : "____"}
                  </span>{" "}
                  {problem.after}
                </p>
                <div style={styles.wordGrid}>
                  {problem.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => pick(opt)}
                      style={{
                        ...styles.wordBtn,
                        borderColor:
                          feedback === "wrong" && wrongPick === opt
                            ? kidColors.berry
                            : feedback === "correct" && opt === problem.answer
                            ? kidColors.grass
                            : "rgba(237,237,224,0.3)",
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {feedback === "correct" && <p style={styles.feedbackText}>Riktig! Bra jobba! 🎉</p>}
            {feedback === "wrong" && <p style={{ ...styles.feedbackText, color: kidColors.berry }}>Prøv igjen! 💪</p>}
          </div>
        )}

        {status === "done" && (
          <div style={{ ...kidShared.card, textAlign: "center" }}>
            <p style={styles.doneEmoji}>🏆</p>
            <p style={styles.doneText}>
              Du fikk {stars} av {ROUND_LENGTH} stjerner!
            </p>
            <button style={styles.againBtn} onClick={startOver}>
              <RotateCcw size={22} style={{ marginRight: 8 }} /> Spill igjen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  levelRow: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  levelBtn: {
    border: "3px solid",
    borderRadius: 16,
    padding: "10px 18px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Kalam', cursive",
    cursor: "pointer",
    minHeight: 48,
  },
  starsRow: { display: "flex", justifyContent: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  prompt: {
    fontFamily: "'Kalam', cursive",
    fontSize: "clamp(24px, 6vw, 32px)",
    fontWeight: 700,
    color: "#EDEDE0",
    marginBottom: 22,
  },
  emojiGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 320, margin: "0 auto" },
  emojiBtn: {
    border: "4px solid",
    borderRadius: 20,
    background: "rgba(237,237,224,0.06)",
    padding: 14,
    fontSize: 40,
    cursor: "pointer",
    minHeight: 90,
    WebkitTapHighlightColor: "transparent",
  },
  wordGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 360, margin: "0 auto" },
  wordBtn: {
    border: "3px solid",
    borderRadius: 16,
    background: "rgba(237,237,224,0.06)",
    color: "#EDEDE0",
    padding: "16px 10px",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 18,
    cursor: "pointer",
    minHeight: 56,
  },
  feedbackText: { fontFamily: "'Kalam', cursive", fontSize: 22, fontWeight: 700, color: "#6FCF6F", marginTop: 18 },
  doneEmoji: { fontSize: 64, margin: "0 0 10px" },
  doneText: { fontFamily: "'Kalam', cursive", fontSize: 26, fontWeight: 700, color: "#EDEDE0", marginBottom: 20 },
  againBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 18,
    background: "#FF7AA2",
    color: "#16221A",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 20,
    padding: "16px 28px",
    minHeight: 56,
    cursor: "pointer",
  },
};
