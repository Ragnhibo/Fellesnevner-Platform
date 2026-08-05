import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard, normalizeText } from "../theme";
import { COUNTRIES } from "../data/countries";
import PageShell from "../components/PageShell";
import Leaderboard, { SaveScoreRow } from "../components/Leaderboard";

const NORWEGIAN_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ".split("");

const DIFFICULTY = {
  lett: { label: "Lett", required: 3, seconds: 90, pool: "common", fields: ["country"] },
  middels: { label: "Middels", required: 5, seconds: 90, pool: "all", fields: ["country", "capital"] },
  vanskelig: { label: "Vanskelig", required: 8, seconds: 75, pool: "all", fields: ["country", "capital"] },
};

function getPool(cfg) {
  return cfg.pool === "common" ? COUNTRIES.filter((c) => c.common) : COUNTRIES;
}

function firstLetter(s) {
  return s.trim()[0]?.toUpperCase();
}

function pickRound(cfg) {
  const letterPool = getPool(cfg); // used only to pick a letter with enough well-known options
  const field = cfg.fields[Math.floor(Math.random() * cfg.fields.length)];
  const counts = {};
  NORWEGIAN_LETTERS.forEach((l) => {
    counts[l] = letterPool.filter((e) => firstLetter(e[field]) === l).length;
  });
  const candidates = NORWEGIAN_LETTERS.filter((l) => counts[l] >= cfg.required);
  const letter = candidates[Math.floor(Math.random() * candidates.length)];
  // Validate against the FULL country list — any real, correct answer counts,
  // not just the smaller "well-known" subset used above to pick a fair letter.
  const validEntries = COUNTRIES.filter((e) => firstLetter(e[field]) === letter);
  return { field, letter, validEntries };
}

export default function Bokstavjakt() {
  usePageTitle("Bokstavjakt");
  const [difficulty, setDifficulty] = useState("middels");
  const cfg = DIFFICULTY[difficulty];
  const [round, setRound] = useState(() => pickRound(cfg));
  const [found, setFound] = useState([]); // array of the matched entries (objects)
  const [input, setInput] = useState("");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(cfg.seconds);
  const [status, setStatus] = useState("playing"); // playing | won | timeup
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);
  const [finalTime, setFinalTime] = useState(null);
  const startTimeRef = useRef(Date.now());
  const inputRef = useRef(null);

  const resetRound = (level) => {
    const nextCfg = DIFFICULTY[level];
    setRound(pickRound(nextCfg));
    setFound([]);
    setInput("");
    setMessage("");
    setSecondsLeft(nextCfg.seconds);
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

  useEffect(() => {
    if (status !== "playing") return;
    if (secondsLeft <= 0) {
      setStatus("timeup");
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, status]);

  const flash = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 1400);
  };

  const submitGuess = () => {
    if (status !== "playing" || !input.trim()) return;
    const guessNorm = normalizeText(input);
    const alreadyFoundNorm = found.map((f) => normalizeText(f[round.field]));

    if (alreadyFoundNorm.includes(guessNorm)) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      flash("Allerede funnet");
      setInput("");
      return;
    }

    const match = round.validEntries.find((e) => normalizeText(e[round.field]) === guessNorm);
    if (!match) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      flash("Ikke riktig");
      setInput("");
      return;
    }

    const nextFound = [...found, match];
    setFound(nextFound);
    setInput("");
    setMessage("");
    if (nextFound.length >= cfg.required) {
      setFinalTime((Date.now() - startTimeRef.current) / 1000);
      setStatus("won");
    }
  };

  const shareResult = async () => {
    const header =
      status === "won"
        ? `Bokstavjakt (${cfg.label}) — fant ${found.length}/${cfg.required} på "${round.letter}"`
        : `Bokstavjakt (${cfg.label}) — ${found.length}/${cfg.required} på "${round.letter}" (tiden løp ut)`;
    const text = `${header}\nfellesnevner.no/bokstavjakt`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  const fieldLabel = round.field === "country" ? "land" : "hovedsteder";
  const foundNorms = found.map((f) => normalizeText(f[round.field]));
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Bokstavjakt</h1>
        <p style={shared.subtitle}>Finn så mange land og hovedsteder du kan på tid.</p>
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
        <p style={styles.prompt}>
          Finn {cfg.required} {fieldLabel} som begynner på
        </p>
        <div style={styles.letterCircle}>{round.letter}</div>

        {status === "playing" && (
          <div style={{ ...styles.timerRow, color: secondsLeft <= 10 ? colors.pink : colors.chalkMuted }}>
            {minutes}:{secs.toString().padStart(2, "0")}
          </div>
        )}

        <p style={styles.progressText}>
          {found.length}/{cfg.required} funnet
        </p>

        {found.length > 0 && (
          <div style={styles.chipRow}>
            {found.map((f, i) => (
              <span key={i} style={styles.chip}>
                {f[round.field]}
              </span>
            ))}
          </div>
        )}

        {status === "playing" && (
          <>
            <div className={shake ? "rt-shake" : ""} style={styles.inputRow}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                placeholder={`Skriv et ${round.field === "country" ? "land" : "en hovedstad"}…`}
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

        {status !== "playing" && (
          <div style={styles.endBanner}>
            <p style={styles.endText}>
              {status === "won"
                ? `Du klarte det! Fant alle ${cfg.required}.`
                : `Tiden løp ut — du fant ${found.length} av ${cfg.required}.`}
            </p>

            <SaveScoreRow game="bokstavjakt" difficulty={difficulty} score={found.length} timeSeconds={finalTime} />

            <p style={styles.revealLabel}>Alle gyldige svar på «{round.letter}»:</p>
            <div style={styles.chipRow}>
              {round.validEntries.map((e, i) => {
                const isFound = foundNorms.includes(normalizeText(e[round.field]));
                return (
                  <span
                    key={i}
                    style={{
                      ...styles.chip,
                      background: isFound ? "rgba(143,201,138,0.18)" : "rgba(217,143,160,0.12)",
                      borderColor: isFound ? colors.mint : "rgba(217,143,160,0.4)",
                    }}
                  >
                    {e[round.field]}
                  </span>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
                <RotateCcw size={16} style={{ marginRight: 6 }} /> Nytt forsøk
              </button>
              <Leaderboard
                game="bokstavjakt"
                difficulties={DIFFICULTY}
                initialDifficulty={difficulty}
                ascending={false}
                unit=" funnet"
                showTime
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
  prompt: {
    color: "#EDEDE0",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 10,
  },
  letterCircle: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    border: "3px dashed #E8C15A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 14px",
    fontFamily: "'Kalam', cursive",
    fontSize: 30,
    fontWeight: 700,
    color: "#E8C15A",
  },
  timerRow: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 700, marginBottom: 8 },
  progressText: { color: "#B9C4B4", fontSize: 13, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 10 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 10 },
  chip: {
    border: "1.5px solid rgba(143,201,138,0.5)",
    background: "rgba(143,201,138,0.15)",
    borderRadius: 999,
    padding: "5px 12px",
    fontSize: 12.5,
    color: "#EDEDE0",
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  inputRow: { display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 8 },
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
  endBanner: { textAlign: "center", marginTop: 12 },
  endText: { color: "#EDEDE0", fontSize: 15, marginBottom: 14, fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 600 },
  revealLabel: { color: "#8FA089", fontSize: 12.5, marginBottom: 8, fontFamily: "'IBM Plex Mono', monospace" },
};
