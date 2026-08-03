import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

const DIFFICULTY = {
  lett: { label: "Lett", seconds: 60, ops: ["+", "-"], addMax: 20, subMax: 20, mulMax: 0, divMax: 0 },
  middels: { label: "Middels", seconds: 60, ops: ["+", "-", "×"], addMax: 50, subMax: 50, mulMax: 12, divMax: 0 },
  vanskelig: {
    label: "Vanskelig",
    seconds: 60,
    ops: ["+", "-", "×", "÷"],
    addMax: 100,
    subMax: 100,
    mulMax: 15,
    divMax: 12,
  },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(cfg) {
  const op = cfg.ops[Math.floor(Math.random() * cfg.ops.length)];
  if (op === "+") {
    const a = randInt(1, cfg.addMax);
    const b = randInt(1, cfg.addMax);
    return { text: `${a} + ${b}`, answer: a + b };
  }
  if (op === "-") {
    let a = randInt(1, cfg.subMax);
    let b = randInt(1, cfg.subMax);
    if (b > a) [a, b] = [b, a];
    return { text: `${a} − ${b}`, answer: a - b };
  }
  if (op === "×") {
    const a = randInt(2, cfg.mulMax);
    const b = randInt(2, cfg.mulMax);
    return { text: `${a} × ${b}`, answer: a * b };
  }
  // division — always constructed to give a whole-number answer
  const divisor = randInt(2, cfg.divMax);
  const quotient = randInt(2, cfg.divMax);
  const dividend = divisor * quotient;
  return { text: `${dividend} ÷ ${divisor}`, answer: quotient };
}

export default function Regnejakt() {
  usePageTitle("Regnejakt");
  const [difficulty, setDifficulty] = useState("middels");
  const cfg = DIFFICULTY[difficulty];
  const [problem, setProblem] = useState(() => generateProblem(cfg));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(cfg.seconds);
  const [status, setStatus] = useState("playing"); // playing | timeup
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const inputRef = useRef(null);

  const resetRound = (level) => {
    const nextCfg = DIFFICULTY[level];
    setProblem(generateProblem(nextCfg));
    setInput("");
    setScore(0);
    setMessage("");
    setSecondsLeft(nextCfg.seconds);
    setStatus("playing");
    setGamesPlayed((n) => n + 1);
    setShareCopied(false);
  };

  const changeDifficulty = (level) => {
    if (level === difficulty) return;
    setDifficulty(level);
    resetRound(level);
  };

  const startNewGame = useCallback(() => {
    resetRound(difficulty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    if (status !== "playing") return;
    if (secondsLeft <= 0) {
      setStatus("timeup");
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, status]);

  useEffect(() => {
    if (status === "playing") inputRef.current?.focus();
  }, [problem, status]);

  const submitGuess = () => {
    if (status !== "playing" || input.trim() === "") return;
    const guess = Number(input.trim().replace(",", "."));
    if (guess === problem.answer) {
      setScore((s) => s + 1);
      setInput("");
      setMessage("");
      setProblem(generateProblem(cfg));
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setMessage("Feil, prøv igjen");
      setTimeout(() => setMessage(""), 1000);
      setInput("");
    }
  };

  const shareResult = async () => {
    const text = `Regnejakt (${cfg.label}) — ${score} poeng på ${cfg.seconds} sekunder\nfellesnevner.no/regnejakt`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Regnejakt</h1>
        <p style={shared.subtitle}>Løs så mange regnestykker du kan før tiden løper ut.</p>
      </div>

      <div style={styles.difficultyRow}>
        {Object.entries(DIFFICULTY).map(([key, c]) => (
          <button
            key={key}
            onClick={() => changeDifficulty(key)}
            className="rt-btn"
            style={{
              ...styles.diffPill,
              background: difficulty === key ? "rgba(232,193,90,0.18)" : "transparent",
              color: difficulty === key ? colors.accent : colors.chalkMuted,
              borderColor: difficulty === key ? colors.accent : "rgba(237,237,224,0.3)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span style={styles.metaText}>Runde {gamesPlayed}</span>
      </div>

      <div style={styles.card}>
        {status === "playing" && (
          <div style={{ ...styles.timerRow, color: secondsLeft <= 10 ? colors.pink : colors.chalkMuted }}>
            {minutes}:{secs.toString().padStart(2, "0")}
          </div>
        )}

        <p style={styles.scoreText}>Poeng: {score}</p>

        {status === "playing" && (
          <>
            <div className={shake ? "rt-shake" : ""} style={styles.problem}>
              {problem.text}
            </div>

            <div style={styles.inputRow}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                placeholder="Svar…"
                inputMode="numeric"
                style={styles.input}
                autoFocus
              />
              <button
                style={{ ...styles.btn, ...styles.btnPrimary, opacity: input.trim() ? 1 : 0.5 }}
                className="rt-btn"
                onClick={submitGuess}
              >
                Svar
              </button>
            </div>
            <div style={styles.messageRow}>{message && <span style={styles.message}>{message}</span>}</div>
          </>
        )}

        {status === "timeup" && (
          <div style={styles.endBanner}>
            <p style={styles.endScore}>{score}</p>
            <p style={styles.endText}>
              regnestykker løst på {cfg.seconds} sekunder ({cfg.label})
            </p>
            <SaveScoreRow game="regnejakt" difficulty={difficulty} score={score} />
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
                <RotateCcw size={16} style={{ marginRight: 6 }} /> Nytt forsøk
              </button>
              <Leaderboard
                game="regnejakt"
                difficulties={DIFFICULTY}
                initialDifficulty={difficulty}
                ascending={false}
                unit=" poeng"
              />
              <button style={{ ...styles.btn, ...styles.btnGhost }} className="rt-btn" onClick={shareResult}>
                <Share2 size={16} style={{ marginRight: 6 }} /> {shareCopied ? "Kopiert!" : "Del resultat"}
              </button>
            </div>
          </div>
        )}
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
  metaText: { color: "#8FA089", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  difficultyRow: { display: "flex", justifyContent: "center", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  diffPill: {
    border: "1.5px solid",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    cursor: "pointer",
    minHeight: 36,
  },
  card: {
    border: "2px dashed rgba(237,237,224,0.3)",
    borderRadius: 10,
    padding: "22px 16px",
    textAlign: "center",
  },
  timerRow: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, marginBottom: 6 },
  scoreText: { color: "#B9C4B4", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 14 },
  problem: {
    fontFamily: "'Kalam', cursive",
    fontSize: "clamp(32px, 9vw, 48px)",
    fontWeight: 700,
    color: "#EDEDE0",
    marginBottom: 18,
  },
  inputRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  input: {
    background: "rgba(237,237,224,0.05)",
    border: "1.5px dashed rgba(237,237,224,0.4)",
    borderRadius: 8,
    padding: "12px 16px",
    color: "#EDEDE0",
    fontSize: 16,
    fontFamily: "'IBM Plex Mono', monospace",
    outline: "none",
    minWidth: 140,
    textAlign: "center",
  },
  messageRow: { minHeight: 20, marginTop: 8 },
  message: { color: "#D98FA0", fontSize: 13, fontWeight: 500 },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    minHeight: 44,
    cursor: "pointer",
  },
  btnGhost: { background: "transparent", border: "1.5px dashed rgba(237,237,224,0.4)", color: "#EDEDE0" },
  btnPrimary: { background: "#E8C15A", color: "#16221A" },
  endBanner: { textAlign: "center", marginTop: 4 },
  endScore: {
    fontFamily: "'Kalam', cursive",
    fontSize: "clamp(48px, 14vw, 72px)",
    fontWeight: 700,
    color: "#E8C15A",
    margin: 0,
    lineHeight: 1,
  },
  endText: { color: "#EDEDE0", fontSize: 14, marginTop: 8, marginBottom: 4, fontFamily: "'IBM Plex Sans', sans-serif" },
};
