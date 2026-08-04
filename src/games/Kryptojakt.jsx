import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2, Lightbulb } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard, normalizeText } from "../theme";
import { ANAGRAM_CLUES, HIDDEN_CLUES } from "../data/kryptoClues";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

const ROUND_LENGTH = 8;

const DIFFICULTY = {
  lett: { label: "Lett", kinds: ["hidden"] },
  middels: { label: "Middels", kinds: ["hidden", "anagram"] },
  vanskelig: { label: "Vanskelig", kinds: ["anagram"] },
};

const ANAGRAM_INDICATORS = ["ødelagt", "forvirret", "i uorden", "omrørt", "rotete"];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildClue(raw, kind) {
  if (kind === "anagram") {
    const indicator = ANAGRAM_INDICATORS[Math.floor(Math.random() * ANAGRAM_INDICATORS.length)];
    return {
      kind: "anagram",
      answer: raw.answer,
      prompt: `${raw.definition} — ${raw.fodder} er ${indicator} (${raw.answer.length})`,
      explanation: `Definisjon: «${raw.definition}». Bokstavene i ${raw.fodder} er nøyaktig de samme som i ${raw.answer} — bare i en annen rekkefølge.`,
    };
  }
  return {
    kind: "hidden",
    answer: raw.answer,
    prompt: `${raw.definition} — gjemt i: «${raw.sentence}» (${raw.answer.length})`,
    explanation: `Definisjon: «${raw.definition}». ${raw.answer} ligger skjult som en sammenhengende bokstavrekke i setningen.`,
  };
}

function buildRound(kinds) {
  const pools = [];
  if (kinds.includes("anagram")) pools.push(...ANAGRAM_CLUES.map((c) => buildClue(c, "anagram")));
  if (kinds.includes("hidden")) pools.push(...HIDDEN_CLUES.map((c) => buildClue(c, "hidden")));
  return shuffle(pools).slice(0, ROUND_LENGTH);
}

export default function Kryptojakt() {
  usePageTitle("Kryptojakt");
  const [difficulty, setDifficulty] = useState("middels");
  const [round, setRound] = useState(() => buildRound(DIFFICULTY["middels"].kinds));
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [showHint, setShowHint] = useState(false);
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
    setShowHint(false);
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
    if (feedback || !textAnswer.trim()) return;
    const correct = normalizeText(textAnswer) === normalizeText(current.answer);
    setFeedback(correct ? "correct" : "wrong");
    setResults((prev) => [...prev, correct]);
    setUserAnswers((prev) => [...prev, textAnswer.trim()]);
    setTimeout(() => {
      setFeedback(null);
      setTextAnswer("");
      setShowHint(false);
      if (qIndex + 1 >= round.length) {
        setFinalTime((Date.now() - startTimeRef.current) / 1000);
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1800);
  };

  const shareResult = async () => {
    const correctCount = results.filter(Boolean).length;
    const grid = results.map((r) => (r ? "✅" : "❌")).join("");
    const text = `Kryptojakt (${DIFFICULTY[difficulty].label}) — ${correctCount}/${ROUND_LENGTH}\n${grid}\nfellesnevner.no/kryptojakt`;
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
        <h1 style={shared.title}>Kryptojakt</h1>
        <p style={shared.subtitle}>Kryptiske hint — anagram og skjulte ord. {ROUND_LENGTH} gåter per runde.</p>
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
          Runde {gamesPlayed} · gåte {Math.min(qIndex + 1, ROUND_LENGTH)}/{ROUND_LENGTH} · {correctCount} riktig
        </span>
      </div>

      {status === "playing" && current && (
        <div style={styles.card}>
          <span style={styles.kindTag}>{current.kind === "anagram" ? "Anagram" : "Skjult ord"}</span>
          <p style={styles.question}>{current.prompt}</p>

          <div style={styles.textRow}>
            <input
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && submitText()}
              placeholder="Svar…"
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

          {!feedback && (
            <button style={styles.hintBtn} onClick={() => setShowHint((h) => !h)}>
              <Lightbulb size={14} style={{ marginRight: 5 }} />
              {showHint ? `Starter med «${current.answer[0]}»` : "Vis første bokstav"}
            </button>
          )}

          {feedback && (
            <>
              <p style={{ ...styles.feedbackText, color: feedback === "correct" ? colors.mint : colors.pink }}>
                {feedback === "correct" ? "Riktig!" : `Feil — svaret var ${current.answer}.`}
              </p>
              <p style={styles.explanationText}>{current.explanation}</p>
            </>
          )}
        </div>
      )}

      {status === "done" && (
        <div style={styles.endBanner}>
          <p style={styles.endText}>
            Du fikk {correctCount} av {ROUND_LENGTH} riktig!
          </p>

          <SaveScoreRow game="kryptojakt" difficulty={difficulty} score={correctCount} timeSeconds={finalTime} />

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
                  <span style={styles.reviewPrompt}>{q.prompt}</span>
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
              game="kryptojakt"
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
    padding: "22px 16px",
    textAlign: "center",
  },
  kindTag: {
    display: "inline-block",
    background: "rgba(232,193,90,0.15)",
    color: colors.accent,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderRadius: 6,
    padding: "4px 10px",
    marginBottom: 12,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  question: {
    color: "#EDEDE0",
    fontSize: "clamp(15px, 3.8vw, 18px)",
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 18,
    lineHeight: 1.5,
  },
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
    minWidth: 200,
    textAlign: "center",
    textTransform: "uppercase",
  },
  hintBtn: {
    display: "inline-flex",
    alignItems: "center",
    background: "none",
    border: "none",
    color: "#8FA089",
    fontSize: 12.5,
    fontFamily: "'IBM Plex Sans', sans-serif",
    cursor: "pointer",
    marginTop: 14,
    padding: 6,
  },
  feedbackText: { marginTop: 14, fontSize: 14, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" },
  explanationText: {
    marginTop: 6,
    fontSize: 12.5,
    color: "#8FA089",
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
  reviewPrompt: { color: "#B9C4B4", fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif" },
  reviewAnswer: { fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" },
};
