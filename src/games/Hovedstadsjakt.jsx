import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard, normalizeText } from "../theme";
import { COUNTRIES } from "../data/countries";
import PageShell from "../components/PageShell";

const ROUND_LENGTH = 10;

const DIFFICULTY = {
  lett: { label: "Lett", type: "mc", pool: "common" },
  middels: { label: "Middels", type: "mc", pool: "all" },
  vanskelig: { label: "Vanskelig", type: "text", pool: "all" },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(pool, type) {
  const shuffled = shuffle(pool).slice(0, ROUND_LENGTH);
  return shuffled.map((entry) => {
    const direction = type === "mc" && Math.random() < 0.5 ? "capital-to-country" : "country-to-capital";
    if (type === "text") {
      return {
        type: "text",
        entry,
        prompt: `Hva er hovedstaden i ${entry.country}?`,
        answer: entry.capital,
      };
    }
    if (direction === "capital-to-country") {
      const wrongs = shuffle(pool.filter((e) => e.country !== entry.country)).slice(0, 3);
      const options = shuffle([entry.country, ...wrongs.map((w) => w.country)]);
      return {
        type: "mc",
        entry,
        prompt: `${entry.capital} er hovedstaden i hvilket land?`,
        answer: entry.country,
        options,
      };
    }
    const wrongs = shuffle(pool.filter((e) => e.capital !== entry.capital)).slice(0, 3);
    const options = shuffle([entry.capital, ...wrongs.map((w) => w.capital)]);
    return {
      type: "mc",
      entry,
      prompt: `Hva er hovedstaden i ${entry.country}?`,
      answer: entry.capital,
      options,
    };
  });
}

export default function Hovedstadsjakt() {
  usePageTitle("Hovedstadsjakt");
  const [difficulty, setDifficulty] = useState("middels");
  const pool = useMemo(
    () => (DIFFICULTY[difficulty].pool === "common" ? COUNTRIES.filter((c) => c.common) : COUNTRIES),
    [difficulty]
  );
  const [round, setRound] = useState(() => buildRound(pool, DIFFICULTY[difficulty].type));
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]); // array of booleans
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [status, setStatus] = useState("playing"); // playing | done
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);

  const current = round[qIndex];

  const resetRound = (level) => {
    const nextPool = DIFFICULTY[level].pool === "common" ? COUNTRIES.filter((c) => c.common) : COUNTRIES;
    setRound(buildRound(nextPool, DIFFICULTY[level].type));
    setQIndex(0);
    setResults([]);
    setSelectedOption(null);
    setTextAnswer("");
    setFeedback(null);
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

  const advance = (wasCorrect) => {
    const nextResults = [...results, wasCorrect];
    setResults(nextResults);
    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setTextAnswer("");
      if (qIndex + 1 >= round.length) {
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1100);
  };

  const pickOption = (opt) => {
    if (feedback) return;
    const correct = opt === current.answer;
    setSelectedOption(opt);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct);
  };

  const submitText = () => {
    if (feedback || !textAnswer.trim()) return;
    const correct = normalizeText(textAnswer) === normalizeText(current.answer);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct);
  };

  const shareResult = async () => {
    const correctCount = results.filter(Boolean).length;
    const grid = results.map((r) => (r ? "✅" : "❌")).join("");
    const text = `Hovedstadsjakt (${DIFFICULTY[difficulty].label}) — ${correctCount}/${ROUND_LENGTH}\n${grid}\nfellesnevner.no/hovedstadsjakt`;
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
        <h1 style={shared.title}>Hovedstadsjakt</h1>
        <p style={shared.subtitle}>Gjett verdens hovedsteder — {ROUND_LENGTH} spørsmål per runde.</p>
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
          <p style={styles.question}>{current.prompt}</p>

          {current.type === "mc" && (
            <div style={styles.optionsGrid}>
              {current.options.map((opt) => {
                let bg = "rgba(237,237,224,0.03)";
                let border = "rgba(237,237,224,0.3)";
                if (feedback && opt === current.answer) {
                  bg = "rgba(143,201,138,0.2)";
                  border = colors.mint;
                } else if (feedback && opt === selectedOption) {
                  bg = "rgba(217,143,160,0.2)";
                  border = colors.pink;
                }
                return (
                  <button
                    key={opt}
                    onClick={() => pickOption(opt)}
                    className="rt-btn"
                    style={{ ...styles.optionBtn, background: bg, borderColor: border }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {current.type === "text" && (
            <div style={styles.textRow}>
              <input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitText()}
                placeholder="Skriv hovedstaden…"
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
          )}

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
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Nytt sett
            </button>
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
    padding: "20px 16px",
    textAlign: "center",
  },
  question: {
    color: "#EDEDE0",
    fontSize: "clamp(16px, 4vw, 19px)",
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 16,
  },
  optionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  optionBtn: {
    border: "1.5px solid",
    borderRadius: 8,
    padding: "14px 10px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    color: "#EDEDE0",
    cursor: "pointer",
    minHeight: 48,
  },
  textRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  input: {
    background: "rgba(237,237,224,0.05)",
    border: "1.5px dashed rgba(237,237,224,0.4)",
    borderRadius: 8,
    padding: "12px 16px",
    color: "#EDEDE0",
    fontSize: 16,
    fontFamily: "'IBM Plex Sans', sans-serif",
    outline: "none",
    minWidth: 200,
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
};
