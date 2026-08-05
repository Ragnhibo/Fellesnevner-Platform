import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import { EVENTS } from "../data/historyEvents";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

const ROUND_LENGTH = 8;

const DIFFICULTY = {
  lett: { label: "Lett", kinds: ["guess-year"], spread: "wide", pool: "common", sortCount: 3, yearInput: "mc" },
  middels: { label: "Middels", kinds: ["guess-year", "sort"], spread: "close", pool: "all", sortCount: 3, yearInput: "mc" },
  vanskelig: { label: "Vanskelig", kinds: ["guess-year", "sort"], spread: "close", pool: "all", sortCount: 4, yearInput: "text" },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool(poolKey) {
  return poolKey === "common" ? EVENTS.filter((e) => e.common) : EVENTS;
}

function buildGuessYear(entry, pool, cfg) {
  if (cfg.yearInput === "text") {
    return { kind: "guess-year", prompt: entry.event, answer: entry.year };
  }
  const others = pool.filter((e) => e.year !== entry.year);
  const byDistance = [...others].sort((a, b) => Math.abs(a.year - entry.year) - Math.abs(b.year - entry.year));
  const candidates = cfg.spread === "wide" ? shuffle(others) : byDistance.slice(0, 8);
  const wrongYears = [];
  const usedYears = new Set([entry.year]);
  for (const c of shuffle(candidates)) {
    if (wrongYears.length >= 3) break;
    if (usedYears.has(c.year)) continue;
    usedYears.add(c.year);
    wrongYears.push(c.year);
  }
  const options = shuffle([entry.year, ...wrongYears]);
  return { kind: "guess-year", prompt: entry.event, answer: entry.year, options };
}

function buildSort(pool, cfg) {
  const shuffled = shuffle(pool);
  const picked = [];
  const usedYears = new Set();
  for (const e of shuffled) {
    if (picked.length >= cfg.sortCount) break;
    if (usedYears.has(e.year)) continue;
    usedYears.add(e.year);
    picked.push(e);
  }
  const correctOrder = [...picked].sort((a, b) => a.year - b.year);
  return { kind: "sort", items: shuffle(picked), correctOrder };
}

function buildRound(cfg) {
  const pool = getPool(cfg.pool);
  const items = [];
  const usedEvents = new Set();
  for (let i = 0; i < ROUND_LENGTH; i++) {
    const useSort = cfg.kinds.includes("sort") && cfg.kinds.length > 1 ? i % 3 === 2 : cfg.kinds[0] === "sort";
    if (useSort && cfg.kinds.includes("sort")) {
      items.push(buildSort(pool, cfg));
    } else {
      const available = pool.filter((e) => !usedEvents.has(e.event));
      const candidates = available.length > 0 ? available : pool;
      const entry = candidates[Math.floor(Math.random() * candidates.length)];
      usedEvents.add(entry.event);
      items.push(buildGuessYear(entry, pool, cfg));
    }
  }
  return items;
}

export default function Arstallsjakt() {
  usePageTitle("Årstallsjakt");
  const [difficulty, setDifficulty] = useState("middels");
  const [round, setRound] = useState(() => buildRound(DIFFICULTY["middels"]));
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [sortPicks, setSortPicks] = useState([]); // indices into current.items, in tap order
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [status, setStatus] = useState("playing");
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [finalTime, setFinalTime] = useState(null);
  const startTimeRef = useRef(Date.now());

  const current = round[qIndex];

  const resetRound = (level) => {
    setRound(buildRound(DIFFICULTY[level]));
    setQIndex(0);
    setResults([]);
    setUserAnswers([]);
    setSelectedOption(null);
    setTextAnswer("");
    setSortPicks([]);
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

  const advance = (wasCorrect, givenAnswer) => {
    setResults((prev) => [...prev, wasCorrect]);
    setUserAnswers((prev) => [...prev, givenAnswer]);
    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setTextAnswer("");
      setSortPicks([]);
      if (qIndex + 1 >= round.length) {
        setFinalTime((Date.now() - startTimeRef.current) / 1000);
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1400);
  };

  const pickYearOption = (opt) => {
    if (feedback) return;
    const correct = opt === current.answer;
    setSelectedOption(opt);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct, String(opt));
  };

  const submitYearText = () => {
    if (feedback || !textAnswer.trim()) return;
    const guess = Number(textAnswer.trim());
    const correct = guess === current.answer;
    setFeedback(correct ? "correct" : "wrong");
    advance(correct, textAnswer.trim());
  };

  const tapSortItem = (idx) => {
    if (feedback || sortPicks.includes(idx)) return;
    const next = [...sortPicks, idx];
    setSortPicks(next);
    if (next.length === current.items.length) {
      const guessedOrder = next.map((i) => current.items[i]);
      const correct = guessedOrder.every((e, i) => e.event === current.correctOrder[i].event);
      setFeedback(correct ? "correct" : "wrong");
      advance(correct, guessedOrder.map((e) => e.event).join(" → "));
    }
  };

  const shareResult = async () => {
    const correctCount = results.filter(Boolean).length;
    const grid = results.map((r) => (r ? "✅" : "❌")).join("");
    const text = `Årstallsjakt (${DIFFICULTY[difficulty].label}) — ${correctCount}/${ROUND_LENGTH}\n${grid}\nfellesnevner.no/arstallsjakt`;
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
        <h1 style={shared.title}>Årstallsjakt</h1>
        <p style={shared.subtitle}>Gjett årstall og sorter hendelser kronologisk — {ROUND_LENGTH} runder.</p>
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

      {status === "playing" && current && current.kind === "guess-year" && (
        <div style={styles.card}>
          <span style={styles.categoryTag}>Gjett årstallet</span>
          <p style={styles.question}>{current.prompt}</p>

          {current.options && (
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
                    onClick={() => pickYearOption(opt)}
                    className="rt-btn"
                    style={{ ...styles.optionBtn, background: bg, borderColor: border }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {!current.options && (
            <div style={styles.textRow}>
              <input
                value={textAnswer}
                onChange={(e) => /^\d{0,4}$/.test(e.target.value) && setTextAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitYearText()}
                placeholder="Årstall…"
                inputMode="numeric"
                style={styles.input}
                disabled={!!feedback}
                autoFocus
              />
              <button
                style={{ ...styles.btn, ...styles.btnPrimary, opacity: textAnswer.trim() ? 1 : 0.5 }}
                className="rt-btn"
                onClick={submitYearText}
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

      {status === "playing" && current && current.kind === "sort" && (
        <div style={styles.card}>
          <span style={styles.categoryTag}>Sorter kronologisk</span>
          <p style={styles.question}>Trykk på hendelsene i rekkefølge, eldst først.</p>

          <div style={styles.sortList}>
            {current.items.map((item, idx) => {
              const pickPosition = sortPicks.indexOf(idx);
              const isPicked = pickPosition !== -1;
              let border = "rgba(237,237,224,0.3)";
              let bg = "rgba(237,237,224,0.03)";
              if (feedback) {
                const correctPos = current.correctOrder.findIndex((e) => e.event === item.event);
                const isRight = pickPosition === correctPos;
                border = isRight ? colors.mint : colors.pink;
                bg = isRight ? "rgba(143,201,138,0.15)" : "rgba(217,143,160,0.15)";
              } else if (isPicked) {
                border = colors.accent;
                bg = "rgba(232,193,90,0.12)";
              }
              return (
                <button
                  key={idx}
                  onClick={() => tapSortItem(idx)}
                  className="rt-btn"
                  disabled={!!feedback || isPicked}
                  style={{ ...styles.sortItem, borderColor: border, background: bg }}
                >
                  <span style={styles.sortBadge}>{isPicked ? pickPosition + 1 : ""}</span>
                  <span style={styles.sortText}>
                    {item.event}
                    {feedback && <span style={styles.sortYear}> ({item.year})</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {feedback && (
            <p style={{ ...styles.feedbackText, color: feedback === "correct" ? colors.mint : colors.pink }}>
              {feedback === "correct" ? "Riktig rekkefølge!" : "Feil rekkefølge — fasit vist over."}
            </p>
          )}
        </div>
      )}

      {status === "done" && (
        <div style={styles.endBanner}>
          <p style={styles.endText}>
            Du fikk {correctCount} av {ROUND_LENGTH} riktig!
          </p>

          <SaveScoreRow game="arstallsjakt" difficulty={difficulty} score={correctCount} timeSeconds={finalTime} />

          <div style={styles.reviewList}>
            {round.map((q, i) => {
              const correct = results[i];
              const prompt =
                q.kind === "guess-year" ? q.prompt : `Sorter: ${q.items.map((e) => e.event).join(", ")}`;
              const answerText =
                q.kind === "guess-year" ? String(q.answer) : q.correctOrder.map((e) => `${e.event} (${e.year})`).join(" → ");
              return (
                <div
                  key={i}
                  style={{
                    ...styles.reviewRow,
                    borderColor: correct ? "rgba(143,201,138,0.4)" : "rgba(217,143,160,0.4)",
                  }}
                >
                  <span style={styles.reviewPrompt}>{prompt}</span>
                  <span style={{ ...styles.reviewAnswer, color: correct ? colors.mint : colors.pink }}>
                    {correct ? `✓ ${answerText}` : `✗ Riktig: ${answerText}`}
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
              game="arstallsjakt"
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
    padding: "20px 16px",
    textAlign: "center",
  },
  categoryTag: {
    display: "inline-block",
    background: "rgba(143,184,217,0.15)",
    color: colors.blue,
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
    marginBottom: 16,
    lineHeight: 1.5,
  },
  optionsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  optionBtn: {
    border: "1.5px solid",
    borderRadius: 8,
    padding: "14px 10px",
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'IBM Plex Mono', monospace",
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
    fontFamily: "'IBM Plex Mono', monospace",
    outline: "none",
    minWidth: 140,
    textAlign: "center",
  },
  sortList: { display: "flex", flexDirection: "column", gap: 8, textAlign: "left" },
  sortItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    border: "1.5px solid",
    borderRadius: 8,
    padding: "12px 14px",
    cursor: "pointer",
    minHeight: 48,
    textAlign: "left",
  },
  sortBadge: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    border: "1.5px solid rgba(237,237,224,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#E8C15A",
    fontFamily: "'IBM Plex Mono', monospace",
    flexShrink: 0,
  },
  sortText: { color: "#EDEDE0", fontSize: 14, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 500 },
  sortYear: { color: "#8FA089", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 },
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
  reviewPrompt: { color: "#B9C4B4", fontSize: 12.5, fontFamily: "'IBM Plex Sans', sans-serif" },
  reviewAnswer: { fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Sans', sans-serif" },
};
