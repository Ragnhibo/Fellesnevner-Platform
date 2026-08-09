import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Delete } from "lucide-react";
import { usePageTitle } from "../theme";
import { kidColors, kidShared } from "../themeKids";

const ROUND_LENGTH = 8;

// Levels are framed by grade, not "Lett/Middels/Vanskelig" — this is a
// practice tool, not a competitive quiz, so the goal is mastery not score.
const LEVELS = {
  trinn1: { label: "1. trinn", max: 10, ops: ["+", "-"] },
  trinn2: { label: "2. trinn", max: 20, ops: ["+", "-"] },
  trinn3: { label: "3. trinn", max: 50, ops: ["+", "-"] },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(level) {
  const cfg = LEVELS[level];
  const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
  if (op === "+") {
    const a = randInt(1, cfg.max - 1);
    const b = randInt(1, cfg.max - a);
    return { text: `${a} + ${b}`, answer: a + b };
  }
  let a = randInt(1, cfg.max);
  let b = randInt(1, cfg.max);
  if (b > a) [a, b] = [b, a];
  return { text: `${a} − ${b}`, answer: a - b };
}

export default function RegnejaktBarn() {
  usePageTitle("Regnejakt for barn");
  const [level, setLevel] = useState("trinn1");
  const [qIndex, setQIndex] = useState(0);
  const [problem, setProblem] = useState(() => generateProblem("trinn1"));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [stars, setStars] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | done

  const changeLevel = (lvl) => {
    setLevel(lvl);
    setQIndex(0);
    setProblem(generateProblem(lvl));
    setInput("");
    setFeedback(null);
    setStars(0);
    setStatus("playing");
  };

  const startOver = useCallback(() => changeLevel(level), [level]);

  const pressDigit = (d) => {
    if (feedback === "correct") return;
    setInput((prev) => (prev.length < 3 ? prev + d : prev));
  };
  const pressBackspace = () => {
    if (feedback === "correct") return;
    setInput((prev) => prev.slice(0, -1));
  };

  const submit = () => {
    if (feedback === "correct" || input === "") return;
    const guess = Number(input);
    if (guess === problem.answer) {
      setFeedback("correct");
      setStars((s) => s + 1);
      setTimeout(() => {
        setFeedback(null);
        setInput("");
        if (qIndex + 1 >= ROUND_LENGTH) {
          setStatus("done");
        } else {
          setQIndex((i) => i + 1);
          setProblem(generateProblem(level));
        }
      }, 900);
    } else {
      setFeedback("wrong");
      setTimeout(() => {
        setFeedback(null);
        setInput("");
      }, 700);
    }
  };

  return (
    <div style={kidShared.page}>
      <div style={kidShared.container}>
        <div style={kidShared.header}>
          <Link to="/barn" style={kidShared.backLink}>
            ← Fellesnevner for barn
          </Link>
          <h1 style={kidShared.title}>Regnejakt 🧮</h1>
          <p style={kidShared.subtitle}>Legg sammen og trekk fra!</p>
        </div>

        <div style={styles.levelRow}>
          {Object.entries(LEVELS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => changeLevel(key)}
              style={{
                ...styles.levelBtn,
                background: level === key ? kidColors.sun : "transparent",
                color: level === key ? "#16221A" : "#EDEDE0",
                borderColor: level === key ? kidColors.sun : "rgba(237,237,224,0.4)",
              }}
            >
              {c.label}
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
            <div
              style={{
                ...styles.problem,
                color:
                  feedback === "correct" ? kidColors.grass : feedback === "wrong" ? kidColors.berry : "#EDEDE0",
              }}
            >
              {problem.text} = {input || "?"}
            </div>

            {feedback === "correct" && <p style={styles.feedbackText}>Riktig! Bra jobba! 🎉</p>}
            {feedback === "wrong" && <p style={{ ...styles.feedbackText, color: kidColors.berry }}>Prøv igjen! 💪</p>}

            <div style={styles.keypad}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button key={d} style={styles.digitBtn} onClick={() => pressDigit(d)}>
                  {d}
                </button>
              ))}
              <button style={styles.digitBtn} onClick={pressBackspace}>
                <Delete size={26} />
              </button>
              <button style={styles.digitBtn} onClick={() => pressDigit("0")}>
                0
              </button>
              <button style={{ ...styles.digitBtn, background: kidColors.grass }} onClick={submit}>
                ✓
              </button>
            </div>
          </div>
        )}

        {status === "done" && (
          <div style={{ ...kidShared.card, textAlign: "center" }}>
            <p style={styles.doneEmoji}>🏆</p>
            <p style={styles.doneText}>
              Du fikk {stars} av {ROUND_LENGTH} stjerner!
            </p>
            <button style={{ ...styles.digitBtn, ...styles.againBtn, background: kidColors.sun }} onClick={startOver}>
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
  problem: {
    fontFamily: "'Kalam', cursive",
    fontSize: "clamp(40px, 12vw, 60px)",
    fontWeight: 700,
    marginBottom: 10,
  },
  feedbackText: {
    fontFamily: "'Kalam', cursive",
    fontSize: 22,
    fontWeight: 700,
    color: "#6FCF6F",
    marginBottom: 16,
  },
  keypad: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    maxWidth: 320,
    margin: "20px auto 0",
  },
  digitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 16,
    background: "rgba(237,237,224,0.1)",
    color: "#EDEDE0",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 26,
    minHeight: 64,
    cursor: "pointer",
    WebkitTapHighlightColor: "transparent",
  },
  doneEmoji: { fontSize: 64, margin: "0 0 10px" },
  doneText: {
    fontFamily: "'Kalam', cursive",
    fontSize: 26,
    fontWeight: 700,
    color: "#EDEDE0",
    marginBottom: 20,
  },
  againBtn: {
    color: "#16221A",
    padding: "16px 28px",
    minHeight: 56,
    width: "auto",
    display: "inline-flex",
    margin: "0 auto",
  },
};
