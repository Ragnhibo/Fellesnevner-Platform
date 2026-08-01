import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Delete } from "lucide-react";
import { shared, colors } from "../theme";
import PageShell from "../components/PageShell";

// A curated list of common, plain bokmål 5-letter words (207 entries).
// Both the daily answer and every accepted guess are drawn from this same
// list — type something not on it and it'll be rejected as "not a word".
// This is a hand-checked list, not a full dictionary dump, so plenty of
// valid Norwegian words outside it will be (incorrectly) rejected. Worth
// swapping in a proper dictionary source before a wider launch.
const WORDS = [
  "STOLT", "VINDU", "HAGEN", "SKOLE", "TOGET", "HUSET", "BILEN", "FJORD",
  "FJELL", "TORSK", "KAFFE", "EGGET", "SUPPE", "KJØTT", "FISKE", "BADET",
  "TAKET", "DØREN", "HAGER", "AVISA", "BYGDA", "JENTA", "DAMEN", "BARNA",
  "FAREN", "MOREN", "BÅTEN", "FLYET", "VEIEN", "BROEN", "HAVET", "SJØEN",
  "ELVEN", "DALEN", "ØYENE", "SOLEN", "MÅNEN", "STORM", "SKYEN", "SNØEN",
  "FROST", "VARME", "LYSET", "MØRKE", "FARGE", "LITEN", "STORE", "VAKRE",
  "STYGG", "GLADE", "TRIST", "REDDE", "MODIG", "STERK", "SVAKE", "RASKE",
  "TREGE", "KLOKE", "VOKSE", "SPISE", "LESER", "LØPER", "HOPPE", "DANSE",
  "SYNGE", "SPILL", "LEKER", "BØKER", "KUNST", "MALER", "TEGNE", "KRONE",
  "VERDI", "KJØPE", "SELGE", "JOBBE", "LÆRER", "BOKEN", "PAPIR", "HVITT",
  "BRUNT", "GRØNT", "LILLA", "GRÅTT", "SVART", "KLART", "ENKEL", "FALSK",
  "SANNE", "NYTTE", "HJELP", "TRENE", "SYKLE", "KJØRE", "FLYGE", "SEILE",
  "TUREN", "FERIE", "REISE", "MOTOR", "BREMS", "GATER", "PLASS", "KVELD",
  "TØRST", "TRØTT", "GLEDE", "FRYKT", "HÅPET", "ANGST", "YDMYK",
  "ELGEN", "BJØRN", "REVEN", "ULVEN", "HJORT", "SVANE", "ØRNEN", "KRÅKE",
  "SNEGL", "HAREN", "GEITA", "SAUEN", "HANEN", "BIENE", "FLUEN",
  "ARMEN", "HODET", "HÅRET", "ØRENE", "NESEN", "MAGEN", "LEVER", "LUNGE",
  "HAKEN", "SMØRE", "SALTE", "EPLET", "PÆREN", "DRUER", "POTET", "LØKEN",
  "SALAT", "KAKAO", "KAKEN", "SMAKE", "STEKE", "KOKER", "BAKER", "SKJÆR",
  "SPEIL", "STIGE", "KOSTE", "SKAPE", "HYLLE", "LAMPE", "PUTER", "TEPPE",
  "VASKE", "RYDDE", "LÅSEN", "SLIPS", "BELTE", "LOMME", "KNAPP", "DRAKT",
  "KÅPEN", "STEIN", "LEIRE", "GRESS", "ROTEN", "GREIN", "ØRKEN", "BREEN",
  "LYNET", "TIMEN", "UKENE", "ÅRENE", "DAGEN", "FEMTI", "TUSEN", "SINNA",
  "SJALU", "ÆRLIG", "FRISK", "TENKE", "HUSKE", "SKRIK", "LATTE", "VELGE",
  "START", "SLUTT", "ENDRE", "PRØVE", "VINNE", "TAPER", "BYGGE", "SVARE",
  "LYTTE", "SANSE", "FØLER", "TENKT", "VISST", "HELLE", "TILBY", "FORBI",
  "INNOM",
];

const MAX_GUESSES = 6;
const WORD_LEN = 5;

const KEY_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Å"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Æ", "Ø"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

const STATUS_PRIORITY = { correct: 3, present: 2, absent: 1 };
const STATUS_COLOR = {
  correct: { bg: "rgba(143,201,138,0.28)", border: colors.mint, text: colors.chalkWhite },
  present: { bg: "rgba(232,193,90,0.24)", border: colors.accent, text: colors.chalkWhite },
  absent: { bg: "rgba(237,237,224,0.05)", border: "rgba(237,237,224,0.15)", text: colors.chalkDim },
};

function pickWord(exclude) {
  if (WORDS.length === 1) return WORDS[0];
  let w;
  do {
    w = WORDS[Math.floor(Math.random() * WORDS.length)];
  } while (w === exclude);
  return w;
}

// Standard two-pass Wordle evaluation, correctly handling repeated letters.
function evaluateGuess(guess, target) {
  const result = Array(WORD_LEN).fill("absent");
  const targetArr = target.split("");
  const guessArr = guess.split("");
  const used = Array(WORD_LEN).fill(false);

  for (let i = 0; i < WORD_LEN; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (result[i] === "correct") continue;
    const idx = targetArr.findIndex((ch, j) => ch === guessArr[i] && !used[j]);
    if (idx !== -1) {
      result[i] = "present";
      used[idx] = true;
    }
  }
  return result;
}

function Tile({ letter, status, delay, filled }) {
  const style = status
    ? { background: STATUS_COLOR[status].bg, borderColor: STATUS_COLOR[status].border, color: STATUS_COLOR[status].text }
    : {
        background: filled ? "rgba(232,193,90,0.08)" : "rgba(237,237,224,0.02)",
        borderColor: filled ? colors.accent : "rgba(237,237,224,0.3)",
        color: colors.chalkWhite,
      };
  return (
    <div
      className={status ? "rt-reveal" : ""}
      style={{ ...styles.tile, ...style, animationDelay: status ? `${delay}ms` : undefined }}
    >
      {letter}
    </div>
  );
}

export default function Ordjakt() {
  const [target, setTarget] = useState(() => pickWord(null));
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState("playing");
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const messageTimeout = useRef(null);

  const letterStatus = {}; // best known status per letter, for keyboard coloring
  guesses.forEach((g) => {
    const evalResult = evaluateGuess(g, target);
    g.split("").forEach((ch, i) => {
      const s = evalResult[i];
      if (!letterStatus[ch] || STATUS_PRIORITY[s] > STATUS_PRIORITY[letterStatus[ch]]) {
        letterStatus[ch] = s;
      }
    });
  });

  const flashMessage = (text) => {
    setMessage(text);
    clearTimeout(messageTimeout.current);
    messageTimeout.current = setTimeout(() => setMessage(""), 1600);
  };

  const startNewGame = useCallback(() => {
    setTarget((prev) => pickWord(prev));
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
    setMessage("");
    setGamesPlayed((n) => n + 1);
  }, []);

  const handleLetter = useCallback((letter) => {
    setCurrentGuess((prev) => (prev.length < WORD_LEN ? prev + letter : prev));
  }, []);

  const handleBackspace = useCallback(() => {
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, []);

  const handleEnter = useCallback(() => {
    if (status !== "playing") return;
    if (currentGuess.length < WORD_LEN) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      flashMessage("For få bokstaver");
      return;
    }
    if (!WORDS.includes(currentGuess)) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      flashMessage("Ikke et ord i ordlisten");
      return;
    }
    const nextGuesses = [...guesses, currentGuess];
    setGuesses(nextGuesses);
    setCurrentGuess("");
    if (currentGuess === target) {
      setStatus("won");
    } else if (nextGuesses.length >= MAX_GUESSES) {
      setStatus("lost");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, currentGuess, guesses, target]);

  useEffect(() => {
    function onKeyDown(e) {
      if (status !== "playing") return;
      if (e.key === "Enter") {
        handleEnter();
        return;
      }
      if (e.key === "Backspace") {
        handleBackspace();
        return;
      }
      if (/^[a-zA-ZæøåÆØÅ]$/.test(e.key)) {
        handleLetter(e.key.toUpperCase());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [status, handleEnter, handleBackspace, handleLetter]);

  const rows = [];
  for (let i = 0; i < MAX_GUESSES; i++) {
    if (i < guesses.length) {
      const g = guesses[i];
      const evalResult = evaluateGuess(g, target);
      rows.push({ letters: g.split(""), statuses: evalResult });
    } else if (i === guesses.length && status === "playing") {
      const letters = currentGuess.split("").concat(Array(WORD_LEN - currentGuess.length).fill(""));
      rows.push({ letters, statuses: null, current: true });
    } else {
      rows.push({ letters: Array(WORD_LEN).fill(""), statuses: null });
    }
  }

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Ordjakt</h1>
        <p style={shared.subtitle}>Gjett det norske ordet på fem bokstaver — seks forsøk.</p>
      </div>

      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <span style={styles.metaText}>Runde {gamesPlayed} · ingen daglig grense</span>
      </div>

      <div className={shake ? "rt-shake" : ""} style={styles.grid}>
        {rows.map((row, ri) => (
          <div key={ri} style={styles.row}>
            {row.letters.map((letter, ci) => (
              <Tile
                key={ci}
                letter={letter}
                status={row.statuses ? row.statuses[ci] : null}
                delay={ci * 90}
                filled={row.current && letter !== ""}
              />
            ))}
          </div>
        ))}
      </div>

      <div style={styles.messageRow}>{message && <span style={styles.message}>{message}</span>}</div>

      {status !== "playing" && (
        <div style={styles.endBanner}>
          <p style={styles.endText}>
            {status === "won"
              ? `Løst på ${guesses.length} ${guesses.length === 1 ? "forsøk" : "forsøk"}!`
              : `Ordet var ${target}.`}
          </p>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
            Nytt ord
          </button>
        </div>
      )}

      {status === "playing" && (
        <div style={styles.keyboard}>
          {KEY_ROWS.map((row, ri) => (
            <div key={ri} style={styles.keyRow}>
              {row.map((key) => {
                if (key === "ENTER") {
                  return (
                    <button key={key} onClick={handleEnter} className="rt-btn" style={{ ...styles.key, ...styles.keyWide }}>
                      SVAR
                    </button>
                  );
                }
                if (key === "BACKSPACE") {
                  return (
                    <button key={key} onClick={handleBackspace} className="rt-btn" style={{ ...styles.key, ...styles.keyWide }}>
                      <Delete size={18} />
                    </button>
                  );
                }
                const s = letterStatus[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleLetter(key)}
                    className="rt-btn"
                    style={{
                      ...styles.key,
                      background: s ? STATUS_COLOR[s].bg : "rgba(237,237,224,0.05)",
                      borderColor: s ? STATUS_COLOR[s].border : "rgba(237,237,224,0.3)",
                      color: s ? STATUS_COLOR[s].text : colors.chalkWhite,
                    }}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          ))}
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
  grid: { display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginBottom: 8 },
  row: { display: "flex", gap: 8 },
  tile: {
    width: "clamp(42px, 11vw, 56px)",
    height: "clamp(42px, 11vw, 56px)",
    border: "2px solid",
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "clamp(18px, 5vw, 24px)",
    fontWeight: 700,
    fontFamily: "'IBM Plex Sans', sans-serif",
    textTransform: "uppercase",
    transition: "background 0.15s, border-color 0.15s",
  },
  messageRow: { minHeight: 24, textAlign: "center", marginTop: 4, marginBottom: 4 },
  message: { color: "#E8C15A", fontSize: 13, fontWeight: 500 },
  endBanner: { textAlign: "center", marginTop: 10, marginBottom: 16 },
  endText: { color: "#EDEDE0", fontSize: 14, marginBottom: 10, fontFamily: "'IBM Plex Sans', sans-serif" },
  btn: {
    display: "inline-flex",
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
  btnPrimary: { background: "#E8C15A", color: "#16221A" },
  keyboard: { display: "flex", flexDirection: "column", gap: 6, marginTop: 14, alignItems: "center" },
  keyRow: { display: "flex", gap: 5, justifyContent: "center" },
  key: {
    border: "1.5px solid",
    borderRadius: 6,
    minWidth: 30,
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    cursor: "pointer",
    padding: "0 8px",
    WebkitTapHighlightColor: "transparent",
  },
  keyWide: { minWidth: 52, fontSize: 11, padding: "0 6px" },
};
