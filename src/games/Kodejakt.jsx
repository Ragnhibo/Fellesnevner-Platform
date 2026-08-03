import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Delete, RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import PageShell from "../components/PageShell";

// Six chalk colors for the code pegs — deliberately distinct from the
// mint/yellow used for feedback below, so the two systems never blend
// together visually.
const COLOR_OPTIONS = [
  { id: "bla", label: "Blå", short: "Bl", hex: "#8FB8D9" },
  { id: "rosa", label: "Rosa", short: "Ro", hex: "#D98FA0" },
  { id: "lilla", label: "Lilla", short: "Li", hex: "#B79FD9" },
  { id: "oransje", label: "Oransje", short: "Or", hex: "#D9975A" },
  { id: "hvit", label: "Hvit", short: "Hv", hex: "#EDEDE0" },
  { id: "rod", label: "Rød", short: "Rø", hex: "#D96B5A" },
];

const DIFFICULTY = {
  lett: { label: "Lett", numColors: 4, pegs: 4, maxGuesses: 10 },
  middels: { label: "Middels", numColors: 6, pegs: 4, maxGuesses: 10 },
  vanskelig: { label: "Vanskelig", numColors: 6, pegs: 5, maxGuesses: 8 },
};

function generateSecret(pegs, numColors) {
  return Array.from({ length: pegs }, () => Math.floor(Math.random() * numColors));
}

// Standard Mastermind scoring: exact matches first, then color-only
// matches among the leftovers (each peg counted at most once).
function evaluateGuess(guess, secret) {
  let exact = 0;
  const secretRemain = [];
  const guessRemain = [];
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      exact++;
    } else {
      secretRemain.push(secret[i]);
      guessRemain.push(guess[i]);
    }
  }
  const counts = {};
  secretRemain.forEach((c) => (counts[c] = (counts[c] || 0) + 1));
  let misplaced = 0;
  guessRemain.forEach((c) => {
    if (counts[c] > 0) {
      misplaced++;
      counts[c]--;
    }
  });
  return { exact, misplaced };
}

function Peg({ colorIdx, empty, size = 40 }) {
  const opt = colorIdx !== null && colorIdx !== undefined ? COLOR_OPTIONS[colorIdx] : null;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: empty ? "2px dashed rgba(237,237,224,0.3)" : "2px solid rgba(0,0,0,0.15)",
        background: opt ? opt.hex : "rgba(237,237,224,0.03)",
        flexShrink: 0,
      }}
    />
  );
}

function FeedbackDots({ exact, misplaced, pegs }) {
  const dots = [
    ...Array(exact).fill("exact"),
    ...Array(misplaced).fill("misplaced"),
    ...Array(pegs - exact - misplaced).fill(null),
  ];
  return (
    <div style={styles.feedbackGrid}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: d === "exact" ? colors.mint : d === "misplaced" ? colors.accent : "rgba(237,237,224,0.1)",
            border: d ? "none" : "1px solid rgba(237,237,224,0.2)",
          }}
        />
      ))}
    </div>
  );
}

function Legend() {
  return (
    <div style={styles.legend}>
      <span style={styles.legendItem}>
        <span style={{ ...styles.legendDot, background: colors.mint }} />
        Riktig farge og plass
      </span>
      <span style={styles.legendItem}>
        <span style={{ ...styles.legendDot, background: colors.accent }} />
        Riktig farge, feil plass
      </span>
    </div>
  );
}

export default function Kodejakt() {
  usePageTitle("Kodejakt");
  const [difficulty, setDifficulty] = useState("middels");
  const cfg = DIFFICULTY[difficulty];
  const [secret, setSecret] = useState(() => generateSecret(cfg.pegs, cfg.numColors));
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState(() => Array(cfg.pegs).fill(null));
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);

  const activeColors = COLOR_OPTIONS.slice(0, cfg.numColors);

  const resetRound = (level) => {
    const nextCfg = DIFFICULTY[level];
    setSecret(generateSecret(nextCfg.pegs, nextCfg.numColors));
    setCurrent(Array(nextCfg.pegs).fill(null));
    setGuesses([]);
    setStatus("playing");
    setMessage("");
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

  const shareResult = async () => {
    const grid = guesses
      .map((g) => {
        const exactStr = "🟢".repeat(g.exact);
        const misplacedStr = "🟡".repeat(g.misplaced);
        const noneStr = "⚪".repeat(cfg.pegs - g.exact - g.misplaced);
        return exactStr + misplacedStr + noneStr;
      })
      .join("\n");
    const header =
      status === "won"
        ? `Kodejakt ${guesses.length}/${cfg.maxGuesses} (${DIFFICULTY[difficulty].label})`
        : `Kodejakt X/${cfg.maxGuesses} (${DIFFICULTY[difficulty].label})`;
    const text = `${header}\n${grid}\nfellesnevner.no/kodejakt`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const pickColor = (colorIdx) => {
    if (status !== "playing") return;
    setCurrent((prev) => {
      const idx = prev.findIndex((c) => c === null);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = colorIdx;
      return next;
    });
  };

  const removeLast = () => {
    setCurrent((prev) => {
      const idx = [...prev].reverse().findIndex((c) => c !== null);
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      const next = [...prev];
      next[realIdx] = null;
      return next;
    });
  };

  const clearRow = () => setCurrent(Array(cfg.pegs).fill(null));

  const submitGuess = () => {
    if (status !== "playing") return;
    if (current.some((c) => c === null)) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      setMessage("Fyll alle plassene først");
      setTimeout(() => setMessage(""), 1600);
      return;
    }
    const { exact, misplaced } = evaluateGuess(current, secret);
    const nextGuesses = [...guesses, { code: current, exact, misplaced }];
    setGuesses(nextGuesses);
    setCurrent(Array(cfg.pegs).fill(null));
    setMessage("");
    if (exact === cfg.pegs) {
      setStatus("won");
    } else if (nextGuesses.length >= cfg.maxGuesses) {
      setStatus("lost");
    }
  };

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Kodejakt</h1>
        <p style={shared.subtitle}>Knekk fargekoden — gjett riktig kombinasjon på {cfg.pegs} felt.</p>
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
          Runde {gamesPlayed} · forsøk {guesses.length}/{cfg.maxGuesses}
        </span>
      </div>

      <Legend />

      <div style={styles.history}>
        {guesses.map((g, i) => (
          <div key={i} style={styles.historyRow}>
            <div style={styles.pegRow}>
              {g.code.map((c, j) => (
                <Peg key={j} colorIdx={c} size={34} />
              ))}
            </div>
            <FeedbackDots exact={g.exact} misplaced={g.misplaced} pegs={cfg.pegs} />
          </div>
        ))}
      </div>

      {status === "playing" && (
        <>
          <div className={shake ? "rt-shake" : ""} style={styles.currentRow}>
            {current.map((c, i) => (
              <Peg key={i} colorIdx={c} empty={c === null} />
            ))}
          </div>

          <div style={styles.messageRow}>{message && <span style={styles.message}>{message}</span>}</div>

          <div style={styles.palette}>
            {activeColors.map((opt, idx) => (
              <button
                key={opt.id}
                onClick={() => pickColor(idx)}
                className="rt-btn"
                style={styles.swatchBtn}
                aria-label={opt.label}
              >
                <Peg colorIdx={idx} size={38} />
              </button>
            ))}
          </div>

          <div style={styles.controls}>
            <button style={{ ...styles.btn, ...styles.btnGhost }} className="rt-btn" onClick={removeLast}>
              <Delete size={16} style={{ marginRight: 6 }} /> Fjern
            </button>
            <button style={{ ...styles.btn, ...styles.btnGhost }} className="rt-btn" onClick={clearRow}>
              Nullstill
            </button>
            <button
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                opacity: current.every((c) => c !== null) ? 1 : 0.5,
              }}
              className="rt-btn"
              onClick={submitGuess}
            >
              Gjett
            </button>
          </div>
        </>
      )}

      {status !== "playing" && (
        <div style={styles.endBanner}>
          <p style={styles.endText}>
            {status === "won" ? `Koden knekket på ${guesses.length} forsøk!` : "Koden var:"}
          </p>
          {status === "lost" && (
            <div style={{ ...styles.pegRow, justifyContent: "center", marginBottom: 12 }}>
              {secret.map((c, i) => (
                <Peg key={i} colorIdx={c} size={38} />
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Ny kode
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
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 12,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11.5,
    color: "#8FA089",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  legendDot: { width: 10, height: 10, borderRadius: "50%", flexShrink: 0 },
  history: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12, maxHeight: "38vh", overflowY: "auto" },
  historyRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    background: "rgba(237,237,224,0.03)",
    borderRadius: 8,
    padding: "8px 10px",
  },
  pegRow: { display: "flex", gap: 6 },
  feedbackGrid: { display: "grid", gridTemplateColumns: "repeat(3, 11px)", gap: 3, flexShrink: 0 },
  currentRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 10 },
  messageRow: { minHeight: 20, textAlign: "center", marginBottom: 4 },
  message: { color: "#E8C15A", fontSize: 13, fontWeight: 500 },
  palette: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 },
  swatchBtn: { background: "none", border: "none", padding: 2, cursor: "pointer", borderRadius: "50%" },
  controls: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" },
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
  endText: { color: "#EDEDE0", fontSize: 14, marginBottom: 10, fontFamily: "'IBM Plex Sans', sans-serif" },
};
