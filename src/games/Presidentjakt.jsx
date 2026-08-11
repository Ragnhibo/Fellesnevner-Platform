import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard, normalizeText } from "../theme";
import { EVENTS, SUCCESSIONS, MONEY, FACTS, ALIASES } from "../data/presidentData";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

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

function uniqueBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getPools(poolKey) {
  const filter = poolKey === "common" ? (e) => e.common : () => true;
  return {
    events: EVENTS.filter(filter),
    successions: SUCCESSIONS.filter(filter),
    money: MONEY.filter(filter),
    facts: FACTS.filter(filter),
  };
}

// Distractors come from the same category's pool so the wrong answers stay
// plausible — presidents from the same kind of question, never a stray name.
function withOptions(prompt, answer, category, poolEntries, answerOf, type) {
  if (type === "text") return { category, prompt, answer };
  const wrongs = uniqueBy(
    shuffle(poolEntries.filter((e) => answerOf(e) !== answer)),
    answerOf
  ).slice(0, 3);
  return { category, prompt, answer, options: shuffle([answer, ...wrongs.map(answerOf)]) };
}

function buildItem(category, entry, pools, type) {
  if (category === "event") {
    return withOptions(
      `Hvem var USAs president under ${entry.event}?`,
      entry.president,
      category,
      pools.events,
      (e) => e.president,
      type
    );
  }
  if (category === "succession") {
    return withOptions(
      `Hvem etterfulgte ${entry.president} som president?`,
      entry.successor,
      category,
      pools.successions,
      (e) => e.successor,
      type
    );
  }
  if (category === "money") {
    return withOptions(
      `Hvilken president er avbildet på ${entry.item}?`,
      entry.president,
      category,
      pools.money,
      (e) => e.president,
      type
    );
  }
  // fact
  return withOptions(entry.clue, entry.president, category, pools.facts, (e) => e.president, type);
}

function buildRound(cfg) {
  const pools = getPools(cfg.pool);
  const tagged = [
    ...pools.events.map((e) => ({ category: "event", entry: e })),
    ...pools.successions.map((e) => ({ category: "succession", entry: e })),
    ...pools.money.map((e) => ({ category: "money", entry: e })),
    ...pools.facts.map((e) => ({ category: "fact", entry: e })),
  ];
  const picks = shuffle(tagged).slice(0, ROUND_LENGTH);
  return picks.map((p) => buildItem(p.category, p.entry, pools, cfg.type));
}

// Full name always counts. Surnames are accepted only where they point to a
// single president — ALIASES leaves them out for Roosevelt, Johnson, Bush
// and Adams, where two presidents share the name.
function answerMatches(given, answer) {
  const g = normalizeText(given);
  if (!g) return false;
  if (g === normalizeText(answer)) return true;
  return (ALIASES[answer] || []).some((alias) => g === normalizeText(alias));
}

const CATEGORY_LABEL = {
  event: "Hendelse",
  succession: "Rekkefølge",
  money: "Penger",
  fact: "Presidentfakta",
};

export default function Presidentjakt() {
  usePageTitle("Presidentjakt");
  const [difficulty, setDifficulty] = useState("middels");
  const [round, setRound] = useState(() => buildRound(DIFFICULTY["middels"]));
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [status, setStatus] = useState("playing"); // playing | done
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
      if (qIndex + 1 >= round.length) {
        setFinalTime((Date.now() - startTimeRef.current) / 1000);
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1200);
  };

  const pickOption = (opt) => {
    if (feedback) return;
    const correct = opt === current.answer;
    setSelectedOption(opt);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct, opt);
  };

  const submitText = () => {
    if (feedback || !textAnswer.trim()) return;
    const correct = answerMatches(textAnswer, current.answer);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct, textAnswer.trim());
  };

  const shareResult = async () => {
    const correctCount = results.filter(Boolean).length;
    const grid = results.map((r) => (r ? "✅" : "❌")).join("");
    const text = `Presidentjakt (${DIFFICULTY[difficulty].label}) — ${correctCount}/${ROUND_LENGTH}\n${grid}\nfellesnevner.no/presidentjakt`;
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
        <h1 style={shared.title}>Presidentjakt</h1>
        <p style={shared.subtitle}>
          USAs presidenter — hendelser, rekkefølge og fakta. {ROUND_LENGTH} spørsmål per runde.
        </p>
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
          <span style={styles.categoryTag}>{CATEGORY_LABEL[current.category]}</span>
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

          {!current.options && (
            <div style={styles.textRow}>
              <input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
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

          <SaveScoreRow game="presidentjakt" difficulty={difficulty} score={correctCount} timeSeconds={finalTime} />

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
              game="presidentjakt"
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
    background: "rgba(217,143,160,0.15)",
    color: colors.pink,
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
