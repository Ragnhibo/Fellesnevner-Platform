import React, { useState, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

const ROUND_LENGTH = 10;
const SEQ_LENGTH = 5; // how many numbers are shown before the "?"

const DIFFICULTY = {
  lett: { label: "Lett", kinds: ["arithmetic"] },
  middels: { label: "Middels", kinds: ["arithmetic", "geometric", "alternating"] },
  vanskelig: { label: "Vanskelig", kinds: ["arithmetic", "geometric", "alternating", "quadratic", "fibonacci"] },
};

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Each generator returns { sequence: number[], answer: number }, where
// sequence has SEQ_LENGTH numbers and answer is the SEQ_LENGTH+1'th term.
function genArithmetic() {
  const start = randInt(1, 20);
  const step = randInt(2, 9) * (Math.random() < 0.5 ? 1 : -1);
  const seq = Array.from({ length: SEQ_LENGTH + 1 }, (_, i) => start + step * i);
  return { sequence: seq.slice(0, SEQ_LENGTH), answer: seq[SEQ_LENGTH] };
}

function genGeometric() {
  const start = randInt(1, 5);
  const ratio = randInt(2, 3);
  const seq = Array.from({ length: SEQ_LENGTH + 1 }, (_, i) => start * Math.pow(ratio, i));
  return { sequence: seq.slice(0, SEQ_LENGTH), answer: seq[SEQ_LENGTH] };
}

function genAlternating() {
  // Two interleaved arithmetic sequences, e.g. 2, 10, 4, 9, 6, 8 -> 8
  const startA = randInt(1, 10);
  const stepA = randInt(1, 4);
  const startB = randInt(10, 20);
  const stepB = -randInt(1, 3);
  const seq = [];
  for (let i = 0; i <= Math.ceil((SEQ_LENGTH + 1) / 2); i++) {
    seq.push(startA + stepA * i);
    seq.push(startB + stepB * i);
  }
  return { sequence: seq.slice(0, SEQ_LENGTH), answer: seq[SEQ_LENGTH] };
}

function genQuadratic() {
  // Differences between terms increase by a constant amount (n^2-ish growth)
  const start = randInt(1, 10);
  const firstDiff = randInt(1, 4);
  const diffStep = randInt(1, 3);
  const seq = [start];
  let diff = firstDiff;
  for (let i = 0; i < SEQ_LENGTH; i++) {
    seq.push(seq[seq.length - 1] + diff);
    diff += diffStep;
  }
  return { sequence: seq.slice(0, SEQ_LENGTH), answer: seq[SEQ_LENGTH] };
}

function genFibonacci() {
  const a0 = randInt(1, 5);
  const a1 = randInt(1, 5);
  const seq = [a0, a1];
  for (let i = 0; i < SEQ_LENGTH; i++) {
    seq.push(seq[seq.length - 1] + seq[seq.length - 2]);
  }
  return { sequence: seq.slice(0, SEQ_LENGTH), answer: seq[SEQ_LENGTH] };
}

const GENERATORS = {
  arithmetic: genArithmetic,
  geometric: genGeometric,
  alternating: genAlternating,
  quadratic: genQuadratic,
  fibonacci: genFibonacci,
};

function buildRound(kinds) {
  return Array.from({ length: ROUND_LENGTH }, () => {
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    const { sequence, answer } = GENERATORS[kind]();
    return { kind, sequence, answer };
  });
}

export default function Sekvensjakt() {
  usePageTitle("Sekvensjakt");
  const [difficulty, setDifficulty] = useState("middels");
  const [round, setRound] = useState(() => buildRound(DIFFICULTY["middels"].kinds));
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [status, setStatus] = useState("playing"); // playing | done
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [finalTime, setFinalTime] = useState(null);
  const startTimeRef = useRef(Date.now());

  const current = round[qIndex];

  const resetRound = (level) => {
    setRound(buildRound(DIFFICULTY[level].kinds));
    setQIndex(0);
    setResults([]);
    setUserAnswers([]);
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

  const submitText = () => {
    if (feedback || textAnswer.trim() === "") return;
    const guess = Number(textAnswer.trim());
    const correct = guess === current.answer;
    setFeedback(correct ? "correct" : "wrong");
    setResults((prev) => [...prev, correct]);
    setUserAnswers((prev) => [...prev, textAnswer.trim()]);
    setTimeout(() => {
      setFeedback(null);
      setTextAnswer("");
      if (qIndex + 1 >= round.length) {
        setFinalTime((Date.now() - startTimeRef.current) / 1000);
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1100);
  };

  const shareResult = async () => {
    const correctCount = results.filter(Boolean).length;
    const grid = results.map((r) => (r ? "✅" : "❌")).join("");
    const text = `Sekvensjakt (${DIFFICULTY[difficulty].label}) — ${correctCount}/${ROUND_LENGTH}\n${grid}\nfellesnevner.no/sekvensjakt`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const correctCount = results.filter(Boolean).length;

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Sekvensjakt</h1>
        <p style={shared.subtitle}>Finn neste tall i rekken — {ROUND_LENGTH} spørsmål per runde.</p>
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
          Runde {gamesPlayed} · spørsmål {Math.min(qIndex + 1, ROUND_LENGTH)}/{ROUND_LENGTH} · {correctCount} riktig
        </span>
      </div>

      {status === "playing" && current && (
        <div style={styles.card}>
          <div style={styles.sequenceRow}>
            {current.sequence.map((n, i) => (
              <span key={i} style={styles.numChip}>
                {n}
              </span>
            ))}
            <span style={{ ...styles.numChip, ...styles.qChip }}>?</span>
          </div>

          <div style={styles.textRow}>
            <input
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitText()}
              placeholder="Neste tall…"
              inputMode="numeric"
              style={styles.input}
              disabled={!!feedback}
              autoFocus
            />
            <button
              style={{ ...styles.btn, ...styles.btnPrimary, opacity: textAnswer.trim() ? 1 : 0.5 }}
              className="rt-btn"
              onClick={submitText}
              disabled={!!feedback}
            >
              Svar
            </button>
          </div>

          {feedback && (
            <p style={{ ...styles.feedbackText, color: feedback === "correct" ? colors.mint : colors.pink }}>
              {feedback === "correct" ? "Riktig!" : `Feil — riktig svar var ${current.answer}.`}
            </p>
          )}
        </div>
      )}

      {status === "done" && (
        <div style={styles.endBanner}>
          <p style={styles.endText}>
            Du fikk {correctCount} av {ROUND_LENGTH} riktig!
          </p>

          <SaveScoreRow game="sekvensjakt" difficulty={difficulty} score={correctCount} timeSeconds={finalTime} />

          <div style={styles.reviewList}>
            {round.map((q, i) => {
              const correct = results[i];
              return (
                <div
                  key={i}
                  style={{
                    ...styles.reviewRow,
                    borderColor: correct ? "rgba(143,201,138,0.4)" : "rgba(217,143,160,0.4)",
                  }}
                >
                  <span style={styles.reviewPrompt}>{q.sequence.join(", ")}, ?</span>
                  <span style={{ ...styles.reviewAnswer, color: correct ? colors.mint : colors.pink }}>
                    {correct ? `✓ ${q.answer}` : `✗ Riktig: ${q.answer}${userAnswers[i] ? ` (du svarte: ${userAnswers[i]})` : ""}`}
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
              game="sekvensjakt"
              difficulties={DIFFICULTY}
              initialDifficulty={difficulty}
              ascending={false}
              unit=" riktige"
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
  sequenceRow: { display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 22 },
  numChip: {
    minWidth: 44,
    height: 44,
    padding: "0 8px",
    borderRadius: 8,
    background: "rgba(237,237,224,0.06)",
    border: "1.5px solid rgba(237,237,224,0.25)",
    color: "#EDEDE0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 18,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  qChip: { borderStyle: "dashed", borderColor: "#E8C15A", color: "#E8C15A" },
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
    minWidth: 160,
    textAlign: "center",
  },
  feedbackText: { marginTop: 14, fontSize: 14, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" },
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
  endText: { color: "#EDEDE0", fontSize: 15, marginBottom: 12, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 },
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
  reviewPrompt: { color: "#B9C4B4", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace" },
  reviewAnswer: { fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" },
};
