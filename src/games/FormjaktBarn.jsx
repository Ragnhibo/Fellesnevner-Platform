import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { usePageTitle } from "../theme";
import { kidColors, kidShared } from "../themeKids";

const ROUND_LENGTH = 8;

const ALL_SHAPES = ["sirkel", "trekant", "kvadrat", "rektangel", "oval", "sekskant", "femkant"];

const LEVELS = {
  trinn1: { label: "1. trinn", shapes: ["sirkel", "trekant", "kvadrat", "rektangel"], mode: "find" },
  trinn2: { label: "2. trinn", shapes: ["sirkel", "trekant", "kvadrat", "rektangel", "oval", "sekskant"], mode: "find" },
  trinn3: { label: "3. trinn", shapes: ALL_SHAPES, mode: "name" },
};

const SHAPE_LABEL = {
  sirkel: "Sirkel",
  trekant: "Trekant",
  kvadrat: "Kvadrat",
  rektangel: "Rektangel",
  oval: "Oval",
  sekskant: "Sekskant",
  femkant: "Femkant",
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ShapeIcon({ type, color, size = 64 }) {
  const s = size;
  const common = { fill: color, stroke: "#16221A", strokeWidth: 2 };
  switch (type) {
    case "sirkel":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" {...common} />
        </svg>
      );
    case "trekant":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,10 92,88 8,88" {...common} />
        </svg>
      );
    case "kvadrat":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="12" y="12" width="76" height="76" {...common} />
        </svg>
      );
    case "rektangel":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x="6" y="26" width="88" height="48" {...common} />
        </svg>
      );
    case "oval":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <ellipse cx="50" cy="50" rx="46" ry="30" {...common} />
        </svg>
      );
    case "sekskant":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="30,8 70,8 94,50 70,92 30,92 6,50" {...common} />
        </svg>
      );
    case "femkant":
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,6 95,40 78,92 22,92 5,40" {...common} />
        </svg>
      );
    default:
      return null;
  }
}

const ICON_COLORS = [kidColors.sun, kidColors.grass, kidColors.sky, kidColors.berry, kidColors.tangerine];

function buildOneProblem(level, target) {
  const cfg = LEVELS[level];
  const distractors = shuffle(cfg.shapes.filter((s) => s !== target)).slice(0, 3);
  const optionShapes = shuffle([target, ...distractors]);
  const optionColors = optionShapes.map(() => ICON_COLORS[Math.floor(Math.random() * ICON_COLORS.length)]);
  return { mode: cfg.mode, target, optionShapes, optionColors };
}

// Deals targets from a shuffled deck of the level's shapes, reshuffling a
// fresh deck only once the current one runs out — guarantees no shape
// repeats until every shape has appeared, however long the round is. Also
// guards the seam between one deck and the next so two deals in a row are
// never the same shape.
function buildRound(level) {
  const cfg = LEVELS[level];
  let deck = [];
  const targets = [];
  for (let i = 0; i < ROUND_LENGTH; i++) {
    if (deck.length === 0) {
      deck = shuffle(cfg.shapes);
      const prev = targets[targets.length - 1];
      if (prev !== undefined && deck[deck.length - 1] === prev && deck.length > 1) {
        // swap the about-to-be-dealt card with another so we don't repeat
        const swapIdx = deck.length - 2;
        [deck[deck.length - 1], deck[swapIdx]] = [deck[swapIdx], deck[deck.length - 1]];
      }
    }
    targets.push(deck.pop());
  }
  return targets.map((t) => buildOneProblem(level, t));
}

export default function FormjaktBarn() {
  usePageTitle("Formjakt for barn");
  const [level, setLevel] = useState("trinn1");
  const [qIndex, setQIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound("trinn1"));
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [wrongPick, setWrongPick] = useState(null);
  const [stars, setStars] = useState(0);
  const [status, setStatus] = useState("playing");

  const problem = round[qIndex];

  const changeLevel = (lvl) => {
    setLevel(lvl);
    setQIndex(0);
    setRound(buildRound(lvl));
    setFeedback(null);
    setWrongPick(null);
    setStars(0);
    setStatus("playing");
  };

  const startOver = useCallback(() => changeLevel(level), [level]);

  const pick = (shape) => {
    if (feedback === "correct") return;
    if (shape === problem.target) {
      setFeedback("correct");
      setStars((s) => s + 1);
      setTimeout(() => {
        setFeedback(null);
        setWrongPick(null);
        if (qIndex + 1 >= ROUND_LENGTH) {
          setStatus("done");
        } else {
          setQIndex((i) => i + 1);
        }
      }, 800);
    } else {
      setFeedback("wrong");
      setWrongPick(shape);
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
          <h1 style={kidShared.title}>Formjakt 🔷</h1>
          <p style={kidShared.subtitle}>Kjenn igjen formene!</p>
        </div>

        <div style={styles.levelRow}>
          {Object.entries(LEVELS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => changeLevel(key)}
              style={{
                ...styles.levelBtn,
                background: level === key ? kidColors.sky : "transparent",
                color: level === key ? "#16221A" : "#EDEDE0",
                borderColor: level === key ? kidColors.sky : "rgba(237,237,224,0.4)",
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
            {problem.mode === "find" ? (
              <>
                <p style={styles.prompt}>Trykk på: {SHAPE_LABEL[problem.target]}</p>
                <div style={styles.shapeGrid}>
                  {problem.optionShapes.map((shape, i) => (
                    <button
                      key={i}
                      onClick={() => pick(shape)}
                      style={{
                        ...styles.shapeBtn,
                        borderColor:
                          feedback === "wrong" && wrongPick === shape
                            ? kidColors.berry
                            : feedback === "correct" && shape === problem.target
                            ? kidColors.grass
                            : "rgba(237,237,224,0.3)",
                      }}
                    >
                      <ShapeIcon type={shape} color={problem.optionColors[i]} />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={styles.prompt}>Hva heter denne formen?</p>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                  <ShapeIcon type={problem.target} color={kidColors.sun} size={110} />
                </div>
                <div style={styles.nameGrid}>
                  {problem.optionShapes.map((shape, i) => (
                    <button
                      key={i}
                      onClick={() => pick(shape)}
                      style={{
                        ...styles.nameBtn,
                        borderColor:
                          feedback === "wrong" && wrongPick === shape
                            ? kidColors.berry
                            : feedback === "correct" && shape === problem.target
                            ? kidColors.grass
                            : "rgba(237,237,224,0.3)",
                      }}
                    >
                      {SHAPE_LABEL[shape]}
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
    fontSize: "clamp(22px, 6vw, 30px)",
    fontWeight: 700,
    color: "#EDEDE0",
    marginBottom: 20,
  },
  shapeGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 320, margin: "0 auto" },
  shapeBtn: {
    border: "4px solid",
    borderRadius: 20,
    background: "rgba(237,237,224,0.06)",
    padding: 14,
    cursor: "pointer",
    minHeight: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
  },
  nameGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 360, margin: "0 auto" },
  nameBtn: {
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
  feedbackText: {
    fontFamily: "'Kalam', cursive",
    fontSize: 22,
    fontWeight: 700,
    color: "#6FCF6F",
    marginTop: 18,
  },
  doneEmoji: { fontSize: 64, margin: "0 0 10px" },
  doneText: { fontFamily: "'Kalam', cursive", fontSize: 26, fontWeight: 700, color: "#EDEDE0", marginBottom: 20 },
  againBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 18,
    background: "#5AAEEE",
    color: "#16221A",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 20,
    padding: "16px 28px",
    minHeight: 56,
    cursor: "pointer",
  },
};
