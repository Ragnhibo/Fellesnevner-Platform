import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { usePageTitle } from "../theme";
import { kidColors, kidShared } from "../themeKids";

const ROUND_LENGTH = 6;

const WORDS = {
  trinn1: [
    { word: "KATT", emoji: "🐱" },
    { word: "HUND", emoji: "🐶" },
    { word: "SOL", emoji: "☀️" },
    { word: "BIL", emoji: "🚗" },
    { word: "TRE", emoji: "🌳" },
    { word: "HUS", emoji: "🏠" },
    { word: "EGG", emoji: "🥚" },
    { word: "BALL", emoji: "⚽" },
  ],
  trinn2: [
    { word: "FISK", emoji: "🐟" },
    { word: "EPLE", emoji: "🍎" },
    { word: "SKOLE", emoji: "🏫" },
    { word: "BANAN", emoji: "🍌" },
    { word: "STOL", emoji: "🪑" },
    { word: "MELK", emoji: "🥛" },
    { word: "KANIN", emoji: "🐰" },
    { word: "BJØRN", emoji: "🐻" },
  ],
  trinn3: [
    { word: "BLOMST", emoji: "🌸" },
    { word: "ELEFANT", emoji: "🐘" },
    { word: "GITAR", emoji: "🎸" },
    { word: "REGNBUE", emoji: "🌈" },
    { word: "SYKKEL", emoji: "🚲" },
    { word: "KYLLING", emoji: "🐔" },
    { word: "JORDBÆR", emoji: "🍓" },
    { word: "PIZZA", emoji: "🍕" },
  ],
};

const LEVEL_LABEL = { trinn1: "1. trinn", trinn2: "2. trinn", trinn3: "3. trinn" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildProblem(level) {
  const pool = WORDS[level];
  const entry = pool[Math.floor(Math.random() * pool.length)];
  const tiles = entry.word.split("").map((letter, i) => ({ id: `${i}-${letter}`, letter }));
  return { word: entry.word, emoji: entry.emoji, tiles: shuffle(tiles) };
}

export default function StaveJaktBarn() {
  usePageTitle("Stavejakt for barn");
  const [level, setLevel] = useState("trinn1");
  const [qIndex, setQIndex] = useState(0);
  const [problem, setProblem] = useState(() => buildProblem("trinn1"));
  const [filled, setFilled] = useState([]);
  const [usedIds, setUsedIds] = useState(new Set());
  const [shakeId, setShakeId] = useState(null);
  const [wordDone, setWordDone] = useState(false);
  const [stars, setStars] = useState(0);
  const [status, setStatus] = useState("playing");

  const changeLevel = (lvl) => {
    setLevel(lvl);
    setQIndex(0);
    setProblem(buildProblem(lvl));
    setFilled([]);
    setUsedIds(new Set());
    setShakeId(null);
    setWordDone(false);
    setStars(0);
    setStatus("playing");
  };

  const startOver = useCallback(() => changeLevel(level), [level]);

  const tapTile = (tile) => {
    if (wordDone || usedIds.has(tile.id)) return;
    const nextIndex = filled.length;
    if (tile.letter === problem.word[nextIndex]) {
      const nextFilled = [...filled, tile];
      setFilled(nextFilled);
      setUsedIds((prev) => new Set(prev).add(tile.id));
      if (nextFilled.length === problem.word.length) {
        setWordDone(true);
        setStars((s) => s + 1);
        setTimeout(() => {
          setFilled([]);
          setUsedIds(new Set());
          setWordDone(false);
          if (qIndex + 1 >= ROUND_LENGTH) {
            setStatus("done");
          } else {
            setQIndex((i) => i + 1);
            setProblem(buildProblem(level));
          }
        }, 1100);
      }
    } else {
      setShakeId(tile.id);
      setTimeout(() => setShakeId(null), 400);
    }
  };

  return (
    <div style={kidShared.page}>
      <div style={kidShared.container}>
        <div style={kidShared.header}>
          <Link to="/barn" style={kidShared.backLink}>
            ← Fellesnevner for barn
          </Link>
          <h1 style={kidShared.title}>Stavejakt ✏️</h1>
          <p style={kidShared.subtitle}>Bygg ordet, bokstav for bokstav!</p>
        </div>

        <div style={styles.levelRow}>
          {Object.entries(LEVEL_LABEL).map(([key, label]) => (
            <button
              key={key}
              onClick={() => changeLevel(key)}
              style={{
                ...styles.levelBtn,
                background: level === key ? kidColors.grass : "transparent",
                color: level === key ? "#16221A" : "#EDEDE0",
                borderColor: level === key ? kidColors.grass : "rgba(237,237,224,0.4)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={styles.starsRow}>
          {Array.from({ length: ROUND_LENGTH }).map((_, i) => (
            <span key={i} style={{ fontSize: 22, opacity: i < stars ? 1 : 0.25 }}>
              ⭐
            </span>
          ))}
        </div>

        {status === "playing" && (
          <div style={kidShared.card}>
            <p style={styles.emoji}>{problem.emoji}</p>

            <div style={styles.slotRow}>
              {problem.word.split("").map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.slot,
                    borderColor: i < filled.length ? kidColors.grass : "rgba(237,237,224,0.4)",
                    background: i < filled.length ? "rgba(111,207,111,0.15)" : "rgba(237,237,224,0.05)",
                  }}
                >
                  {filled[i]?.letter || ""}
                </div>
              ))}
            </div>

            {wordDone && <p style={styles.feedbackText}>Riktig! Bra jobba! 🎉</p>}

            <div style={styles.tileRow}>
              {problem.tiles.map((tile) => {
                const used = usedIds.has(tile.id);
                return (
                  <button
                    key={tile.id}
                    onClick={() => tapTile(tile)}
                    disabled={used || wordDone}
                    style={{
                      ...styles.tileBtn,
                      opacity: used ? 0.15 : 1,
                      transform: shakeId === tile.id ? "translateX(4px)" : "none",
                      borderColor: shakeId === tile.id ? kidColors.berry : "rgba(237,237,224,0.4)",
                    }}
                  >
                    {tile.letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {status === "done" && (
          <div style={{ ...kidShared.card, textAlign: "center" }}>
            <p style={styles.doneEmoji}>🏆</p>
            <p style={styles.doneText}>
              Du stavet {stars} av {ROUND_LENGTH} ord riktig!
            </p>
            <button style={styles.againBtn} onClick={startOver}>
              <RotateCcw size={22} style={{ marginRight: 8 }} /> Spill igjen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  levelRow: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  levelBtn: {
    border: "3px solid",
    borderRadius: 16,
    padding: "10px 18px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "'Kalam', cursive",
    cursor: "pointer",
    minHeight: 48,
  },
  starsRow: { display: "flex", justifyContent: "center", gap: 4, marginBottom: 16, flexWrap: "wrap" },
  emoji: { fontSize: 70, margin: "0 0 20px" },
  slotRow: { display: "flex", justifyContent: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  slot: {
    width: 46,
    height: 54,
    border: "3px solid",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 28,
    color: "#EDEDE0",
  },
  feedbackText: { fontFamily: "'Kalam', cursive", fontSize: 22, fontWeight: 700, color: "#6FCF6F", marginBottom: 16 },
  tileRow: { display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginTop: 10 },
  tileBtn: {
    width: 54,
    height: 54,
    border: "3px solid",
    borderRadius: 12,
    background: "rgba(237,237,224,0.1)",
    color: "#EDEDE0",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 24,
    cursor: "pointer",
    transition: "transform 0.1s, opacity 0.3s",
    WebkitTapHighlightColor: "transparent",
  },
  doneEmoji: { fontSize: 64, margin: "0 0 10px" },
  doneText: { fontFamily: "'Kalam', cursive", fontSize: 26, fontWeight: 700, color: "#EDEDE0", marginBottom: 20 },
  againBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 18,
    background: "#6FCF6F",
    color: "#16221A",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 20,
    padding: "16px 28px",
    minHeight: 56,
    cursor: "pointer",
  },
};
