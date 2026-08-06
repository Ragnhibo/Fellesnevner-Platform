import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import { QUESTIONS } from "../data/guessData";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

const ROUND_LENGTH = 10;

// Difficulty controls how harshly a miss is punished, not the question
// pool itself — every answer is 0-100 regardless of level, same as the
// physical game, so there's nothing to gate behind "easy" vs "hard"
// content. Score per question = max(0, 100 - avvik * strictness).
const DIFFICULTY = {
  lett: { label: "Lett", strictness: 1 },
  middels: { label: "Middels", strictness: 2 },
  vanskelig: { label: "Vanskelig", strictness: 3 },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound() {
  return shuffle(QUESTIONS).slice(0, ROUND_LENGTH);
}

function scoreFor(diff, strictness) {
  return Math.max(0, Math.round(100 - diff * strictness));
}

export default function Gjettejakt() {
  usePageTitle("Gjettejakt");
  const [difficulty, setDifficulty] = useState("middels");
  const [round, setRound] = useState(() => buildRound());
  const [qIndex, setQIndex] = useState(0);
  const [pointsEarned, setPointsEarned] = useState([]);
  const [guesses, setGuesses] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // { diff, points } | null
  const [status, setStatus] = useState("playing"); // playing | done
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [finalTime, setFinalTime] = useState(null);
  const startTimeRef = useRef(Date.now());

  const current = round[qIndex];
  const cfg = DIFFICULTY[difficulty];

  const resetRound = (level) => {
    setRound(buildRound());
    setQIndex(0);
    setPointsEarned([]);
    setGuesses([]);
    setTextAnswer("");
    setFeedback(null);
    setStatus("playing");
    setGamesPlayed((n) => n + 1);
    setShareCopied(false);
    setFinalTime(null);
    startTimeRef.current = Date.now();
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

  const submitGuess = () => {
    if (feedback || textAnswer.trim() === "") return;
    const guess = Number(textAnswer.trim());
    const diff = Math.abs(guess - current.answer);
    const points = scoreFor(diff, DIFFICULTY[difficulty].strictness);
    setFeedback({ diff, points });
    setPointsEarned((prev) => [...prev, points]);
    setGuesses((prev) => [...prev, guess]);
    setTimeout(() => {
      setFeedback(null);
      setTextAnswer("");
      if (qIndex + 1 >= round.length) {
        setFinalTime((Date.now() - startTimeRef.current) / 1000);
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1600);
  };

  const totalPoints = pointsEarned.reduce((a, b) => a + b, 0);

  const shareResult = async () => {
    const avg = Math.round(totalPoints / round.length);
    const text = `Gjettejakt (${DIFFICULTY[difficulty].label}) — ${totalPoints} poeng (snitt ${avg}/100)\nfellesnevner.no/gjettejakt`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Gjettejakt</h1>
        <p style={shared.subtitle}>Svaret er alltid et tall mellom 0 og 100 — hvor nære kommer du?</p>
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

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <span style={styles.metaText}>
          Runde {gamesPlayed} · spørsmål {Math.min(qIndex + 1, ROUND_LENGTH)}/{ROUND_LENGTH} · {totalPoints} poeng
        </span>
      </div>

      {status === "playing" && current && (
        <div style={styles.card}>
          <p style={styles.question}>{current.question}</p>
          <p style={styles.rangeHint}>Svar: 0–100{current.unit ? ` (${current.unit})` : ""}</p>

          <div style={styles.textRow}>
            <input
              value={textAnswer}
              onChange={(e) => /^\d{0,3}$/.test(e.target.value) && setTextAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitGuess()}
              placeholder="0–100"
              inputMode="numeric"
              style={styles.input}
              disabled={!!feedback}
              autoFocus
            />
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: textAnswer.trim() ? 1 : 0.5 }}
              className="rt-btn"
              onClick={submitGuess}
              disabled={!!feedback}
            >
              Svar
            </button>
          </div>

          {feedback && (
            <p
              style={{
                ...styles.feedbackText,
                color: feedback.points >= 90 ? colors.mint : feedback.points >= 60 ? colors.accent : colors.pink,
              }}
            >
              Riktig svar: {current.answer}
              {current.unit ? ` ${current.unit}` : ""} — avvik {feedback.diff} · +{feedback.points} poeng
            </p>
          )}
        </div>
      )}

      {status === "done" && (
        <div style={styles.endBanner}>
          <p style={styles.endScore}>{totalPoints}</p>
          <p style={styles.endText}>poeng av {round.length * 100} mulige</p>

          <SaveScoreRow game="gjettejakt" difficulty={difficulty} score={totalPoints} timeSeconds={finalTime} />

          <div style={styles.reviewList}>
            {round.map((q, i) => {
              const points = pointsEarned[i];
              const good = points >= 80;
              return (
                <div
                  key={i}
                  style={{
                    ...styles.reviewRow,
                    borderColor: good ? "rgba(143,201,138,0.4)" : "rgba(217,143,160,0.4)",
                  }}
                >
                  <span style={styles.reviewPrompt}>{q.question}</span>
                  <span style={{ ...styles.reviewAnswer, color: good ? colors.mint : colors.pink }}>
                    Fasit: {q.answer}
                    {q.unit ? ` ${q.unit}` : ""} · Du svarte: {guesses[i]} · {points} poeng
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Nytt sett
            </button>
            <Leaderboard
              game="gjettejakt"
              difficulties={DIFFICULTY}
              initialDifficulty={difficulty}
              ascending={false}
              unit=" poeng"
              showTime
            />
            <button style={{ ...styles.btn, ...styles.btnGhost }} className="rt-btn" onClick={shareResult}>
              <Share2 size={16} style={{ marginRight: 6 }} /> {shareCopied ? "Kopiert!" : "Del resultat"}
            </button>
          </div>
        </div>
      )}
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
    padding: "24px 16px",
    textAlign: "center",
  },
  question: {
    color: "#EDEDE0",
    fontSize: "clamp(16px, 4vw, 19px)",
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 8,
    lineHeight: 1.5,
  },
  rangeHint: { color: "#8FA089", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 20 },
  textRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
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
  feedbackText: {
    marginTop: 16,
    fontSize: 13.5,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    lineHeight: 1.5,
  },
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
  endBanner: { textAlign: "center", marginTop: 10 },
  endScore: {
    fontFamily: "'Kalam', cursive",
    fontSize: "clamp(48px, 14vw, 72px)",
    fontWeight: 700,
    color: "#E8C15A",
    margin: 0,
    lineHeight: 1,
  },
  endText: { color: "#B9C4B4", fontSize: 14, marginTop: 4, marginBottom: 14, fontFamily: "'IBM Plex Sans', sans-serif" },
  reviewList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 16,
    maxHeight: "44vh",
    overflowY: "auto",
    textAlign: "left",
  },
  reviewRow: {
    border: "1.5px solid",
    borderRadius: 8,
    padding: "8px 12px",
    background: "rgba(237,237,224,0.03)",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  reviewPrompt: { color: "#B9C4B4", fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif" },
  reviewAnswer: { fontSize: 12.5, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" },
};
