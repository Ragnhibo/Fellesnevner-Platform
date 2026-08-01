import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Shuffle, RotateCcw, X, Trophy } from "lucide-react";
import { supabase } from "../supabaseClient";
import { shared, colors, usePageTitle } from "../theme";
import PageShell from "../components/PageShell";

// ---------- Puzzle bank, grouped by difficulty ----------
const POOLS = {
  lett: [
    {
      theme: "Det aller enkleste",
      groups: [
        { label: "Frukter", words: ["EPLE", "PÆRE", "BANAN", "APPELSIN"] },
        { label: "Årstider", words: ["VÅR", "SOMMER", "HØST", "VINTER"] },
        { label: "Farger", words: ["RØD", "BLÅ", "GUL", "GRØNN"] },
        { label: "Ukedager", words: ["MANDAG", "TIRSDAG", "ONSDAG", "TORSDAG"] },
      ],
    },
    {
      theme: "Hverdagsting",
      groups: [
        { label: "Dyr", words: ["HUND", "KATT", "HEST", "KU"] },
        { label: "Kjøretøy", words: ["BIL", "BUSS", "SYKKEL", "TOG"] },
        { label: "Klesplagg", words: ["GENSER", "BUKSE", "SKJORTE", "JAKKE"] },
        { label: "Møbler", words: ["SOFA", "BORD", "STOL", "SENG"] },
      ],
    },
    {
      theme: "Hjem og skole",
      groups: [
        { label: "Måltider", words: ["FROKOST", "LUNSJ", "MIDDAG", "KVELDSMAT"] },
        { label: "Kjøkkenting", words: ["KNIV", "GAFFEL", "SKJE", "KOPP"] },
        { label: "Skolefag", words: ["MATTE", "NORSK", "ENGELSK", "GYM"] },
        { label: "Kroppsdeler", words: ["ARM", "BEIN", "HODE", "HÅND"] },
      ],
    },
  ],
  middels: [
    {
      theme: "Vinter i Norge",
      groups: [
        { label: "Julebordmat", words: ["PINNEKJØTT", "LUTEFISK", "RIBBE", "RAKFISK"] },
        { label: "Vintersport", words: ["SLALÅM", "LANGRENN", "HOPP", "SKØYTER"] },
        { label: "I sekken på fjellet", words: ["TERMOS", "MATPAKKE", "LUE", "VOTTER"] },
        { label: "Snøforhold", words: ["NYSNØ", "SKARE", "SLAPS", "FONN"] },
      ],
    },
    {
      theme: "På fotballbanen",
      groups: [
        { label: "Posisjoner", words: ["MÅLVAKT", "FORSVARER", "MIDTBANE", "SPISS"] },
        { label: "Dommeravgjørelser", words: ["OFFSIDE", "STRAFFE", "HJØRNESPARK", "FRISPARK"] },
        { label: "Utstyr", words: ["BALL", "KEEPERHANSKER", "LEGGBESKYTTER", "FLØYTE"] },
        { label: "Turneringer", words: ["VM", "EM", "CHAMPIONS LEAGUE", "ELITESERIEN"] },
      ],
    },
    {
      theme: "Kaffekopp",
      groups: [
        { label: "Kaffetyper", words: ["ESPRESSO", "LATTE", "CAPPUCCINO", "MOKKA"] },
        { label: "Bakst til kaffen", words: ["BOLLE", "SKOLEBRØD", "VAFLER", "KRINGLE"] },
        { label: "På kaféen", words: ["SERVIETT", "MENY", "TERMOKANNE", "SUKKERBIT"] },
        { label: "Trøtt", words: ["SLITEN", "UTMATTET", "SØVNIG", "GJESPENDE"] },
      ],
    },
    {
      theme: "Hyttetur",
      groups: [
        { label: "På hytta", words: ["PEIS", "VED", "SOVEPOSE", "LYKT"] },
        { label: "Kortspill", words: ["KASINO", "WHIST", "RUMMY", "PRESIDENT"] },
        { label: "Friluftsaktiviteter", words: ["FISKE", "BADING", "VEDHOGGING", "BÆRPLUKKING"] },
        { label: "Norske høytider", words: ["JUL", "PÅSKE", "PINSE", "17. MAI"] },
      ],
    },
    {
      theme: "Oslo",
      groups: [
        { label: "Bydeler", words: ["GRÜNERLØKKA", "FROGNER", "MAJORSTUEN", "SAGENE"] },
        { label: "Transport", words: ["T-BANE", "TRIKK", "FERGE", "BUSS"] },
        { label: "Severdigheter", words: ["VIGELANDSPARKEN", "OPERAHUSET", "AKERSHUS FESTNING", "HOLMENKOLLEN"] },
        { label: "Gatemat", words: ["PØLSE", "VAFFEL", "IS", "LOMPE"] },
      ],
    },
    {
      theme: "Vær og vind",
      groups: [
        { label: "Værtyper", words: ["REGN", "SOL", "SNØ", "TÅKE"] },
        { label: "Vindstyrker", words: ["BRIS", "KULING", "STORM", "ORKAN"] },
        { label: "Årstider", words: ["VÅR", "SOMMER", "HØST", "VINTER"] },
        { label: "Kaldt", words: ["ISKALD", "KJØLIG", "FRYSENDE", "RÅKALD"] },
      ],
    },
    {
      theme: "På kontoret",
      groups: [
        { label: "I møterommet", words: ["PROJEKTOR", "WHITEBOARD", "FLIPOVER", "LAPTOP"] },
        { label: "HR-begreper", words: ["ONBOARDING", "MEDARBEIDERSAMTALE", "REKRUTTERING", "ORGANISASJONSKART"] },
        { label: "I pausen", words: ["KAFFEMASKIN", "LUNSJROM", "SOFAKROK", "VANNKJØLER"] },
        { label: "Enda et møte", words: ["WORKSHOP", "SEMINAR", "BRIEFING", "SYNC"] },
      ],
    },
    {
      theme: "Norsk slang",
      groups: [
        { label: "Penger", words: ["GRYN", "STÅL", "SPENN", "DOLLAR"] },
        { label: "Kjekk", words: ["KJEKK", "STILIG", "TØFF", "KNALL"] },
        { label: "Gøy", words: ["ARTIG", "MORSOMT", "KOSELIG", "GØY"] },
        { label: "Raskt", words: ["KJAPT", "RASKT", "SPREK", "FIKS"] },
      ],
    },
  ],
  vanskelig: [
    {
      theme: "Dobbeltbetydninger i fotball",
      groups: [
        { label: "Fotballposisjoner", words: ["KEEPER", "LIBERO", "BACK", "SPISS"] },
        { label: "Betyr skarp eller spiss", words: ["SKARP", "HVASS", "EGGET", "KVASS"] },
        { label: "Ord foran «-SPARK»", words: ["FRI", "HJØRNE", "STRAFFE", "INN"] },
        { label: "Å vinne stort, i slang", words: ["KNUSE", "SLÅ", "BANKE", "DOMINERE"] },
      ],
    },
    {
      theme: "Ord som låner hverandres klær",
      groups: [
        { label: "Fotballutstyr", words: ["BALL", "MÅL", "NETT", "DOMMER"] },
        { label: "Ord foran «-BALL»", words: ["FOT", "HÅND", "VOLLEY", "BASKET"] },
        { label: "Ord foran «-SKO»", words: ["TRE", "INNE", "TURN", "LØPE"] },
        { label: "Betyr rask", words: ["RASK", "KVIKK", "SNAR", "FIKS"] },
      ],
    },
    {
      theme: "Fjellet er ikke alltid det det ser ut som",
      groups: [
        { label: "Tas med på tur", words: ["MATPAKKE", "KART", "KOMPASS", "DRIKKEFLASKE"] },
        { label: "Norske fjelltopper", words: ["GALDHØPIGGEN", "SNØHETTA", "GAUSTATOPPEN", "GLITTERTIND"] },
        { label: "Ord foran «-TUR»", words: ["SKI", "FJELL", "SYKKEL", "PADLE"] },
        { label: "Preposisjoner", words: ["OVER", "UNDER", "GJENNOM", "RUNDT"] },
      ],
    },
  ],
};

// Chalk colors — four sticks of classroom chalk, not corporate flat swatches.
const TIER_COLORS = [
  { chalk: "#E8C15A", dim: "rgba(232,193,90,0.16)" }, // yellow chalk
  { chalk: "#8FC98A", dim: "rgba(143,201,138,0.16)" }, // mint chalk
  { chalk: "#8FB8D9", dim: "rgba(143,184,217,0.16)" }, // blue chalk
  { chalk: "#D98FA0", dim: "rgba(217,143,160,0.16)" }, // pink chalk
];

const DIFFICULTY = {
  lett: { label: "Lett", mistakes: 6, hints: true },
  middels: { label: "Middels", mistakes: 4, hints: true },
  vanskelig: { label: "Vanskelig", mistakes: 2, hints: false },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildTiles(puzzle) {
  const tiles = [];
  puzzle.groups.forEach((g, tier) => {
    g.words.forEach((w) => tiles.push({ word: w, tier, id: `${tier}-${w}` }));
  });
  return shuffle(tiles);
}

function pickPuzzleIndex(pool, exclude) {
  if (pool.length === 1) return 0;
  let idx;
  do {
    idx = Math.floor(Math.random() * pool.length);
  } while (idx === exclude);
  return idx;
}

function formatTime(ms) {
  const totalSeconds = ms / 1000;
  const m = Math.floor(totalSeconds / 60);
  const s = (totalSeconds % 60).toFixed(1);
  return m > 0 ? `${m}:${s.padStart(4, "0")}` : `${s}s`;
}

// Deterministic small tilt per word, so each chalk tile looks hand-drawn
// but doesn't jitter between renders/shuffles.
function tileTilt(word) {
  let h = 0;
  for (let i = 0; i < word.length; i++) h = (h * 31 + word.charCodeAt(i)) % 997;
  return ((h % 5) - 2) * 0.9; // -1.8deg .. 1.8deg
}

// Renders mistakes as chalkboard tally marks, grouped in bundles of five
// (four verticals + one diagonal strike), instead of dots or hearts.
function TallyMarks({ max, count }) {
  const groups = [];
  let remaining = max;
  while (remaining > 0) {
    const size = Math.min(5, remaining);
    groups.push(size);
    remaining -= size;
  }
  let drawnSoFar = 0;
  return (
    <div style={{ display: "flex", gap: 10 }}>
      {groups.map((size, gi) => {
        const marksInGroup = Array.from({ length: size }, (_, i) => {
          const idx = drawnSoFar + i;
          const filled = idx < count;
          return filled;
        });
        drawnSoFar += size;
        const w = size === 5 ? 26 : size * 5 + 2;
        return (
          <svg key={gi} width={w} height="18" viewBox={`0 0 ${w} 18`}>
            {marksInGroup.slice(0, 4).map((filled, i) => (
              <line
                key={i}
                x1={3 + i * 5}
                y1="1"
                x2={3 + i * 5}
                y2="17"
                stroke={filled ? "#D98FA0" : "rgba(237,237,224,0.25)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            {size === 5 && (
              <line
                x1="1"
                y1="17"
                x2="21"
                y2="1"
                stroke={marksInGroup[4] ? "#D98FA0" : "rgba(237,237,224,0.25)"}
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

// The signature reveal: solved words underlined with a self-drawing chalk
// stroke, category name written beneath in a handwritten face — the visual
// metaphor for "finding the fellesnevner" of four words.
function FractionReveal({ words, label, color, delay }) {
  return (
    <div className="rt-reveal" style={{ ...styles.revealItem, animationDelay: `${delay}ms` }}>
      <div style={styles.revealWords}>{words.join("   ·   ")}</div>
      <svg width="100%" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" style={{ display: "block" }}>
        <path
          className="rt-chalk-line"
          d="M4 5 Q 40 2, 75 5 T 145 5 T 220 5 T 296 5"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="1"
          style={{ animationDelay: `${delay + 120}ms` }}
        />
      </svg>
      <div style={{ ...styles.revealLabel, color }}>{label}</div>
    </div>
  );
}

export default function Ordspill() {
  usePageTitle("Ordspill");
  const [difficulty, setDifficulty] = useState("middels");
  const [puzzleIdx, setPuzzleIdx] = useState(() =>
    Math.floor(Math.random() * POOLS["middels"].length)
  );
  const pool = POOLS[difficulty];
  const puzzle = pool[puzzleIdx];

  const [tiles, setTiles] = useState(() => buildTiles(puzzle));
  const [selected, setSelected] = useState([]);
  const [found, setFound] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState("");
  const [shakeIds, setShakeIds] = useState([]);
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [status, setStatus] = useState("playing");

  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef(Date.now());
  const finalTimeRef = useRef(null);

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardDifficulty, setLeaderboardDifficulty] = useState("middels");
  const [scores, setScores] = useState([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [nickname, setNickname] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const maxMistakes = DIFFICULTY[difficulty].mistakes;
  const hintsOn = DIFFICULTY[difficulty].hints;

  const remainingTiles = useMemo(
    () => tiles.filter((t) => !found.includes(t.tier)),
    [tiles, found]
  );

  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === "won" && finalTimeRef.current === null) {
      finalTimeRef.current = Date.now() - startRef.current;
    }
  }, [status]);

  const resetRoundState = () => {
    setSelected([]);
    setFound([]);
    setMistakes(0);
    setMessage("");
    setShakeIds([]);
    setStatus("playing");
    setGamesPlayed((n) => n + 1);
    setElapsedMs(0);
    startRef.current = Date.now();
    finalTimeRef.current = null;
    setNickname("");
    setScoreSaved(false);
  };

  const startNewGame = useCallback(() => {
    setPuzzleIdx((prev) => {
      const next = pickPuzzleIndex(POOLS[difficulty], prev);
      setTiles(buildTiles(POOLS[difficulty][next]));
      return next;
    });
    resetRoundState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  const changeDifficulty = (level) => {
    if (level === difficulty) return;
    const nextPool = POOLS[level];
    const nextIdx = Math.floor(Math.random() * nextPool.length);
    setDifficulty(level);
    setPuzzleIdx(nextIdx);
    setTiles(buildTiles(nextPool[nextIdx]));
    resetRoundState();
  };

  const toggleTile = (tile) => {
    if (status !== "playing") return;
    setMessage("");
    setSelected((prev) => {
      const already = prev.find((t) => t.id === tile.id);
      if (already) return prev.filter((t) => t.id !== tile.id);
      if (prev.length >= 4) return prev;
      return [...prev, tile];
    });
  };

  const doShuffle = () => {
    setTiles((prev) => {
      const remaining = shuffle(prev.filter((t) => !found.includes(t.tier)));
      const solved = prev.filter((t) => found.includes(t.tier));
      return [...solved, ...remaining];
    });
  };

  const deselect = () => setSelected([]);

  const submit = () => {
    if (selected.length !== 4 || status !== "playing") return;
    const tier = selected[0].tier;
    const allSameTier = selected.every((t) => t.tier === tier);

    if (allSameTier) {
      const newFound = [...found, tier];
      setFound(newFound);
      setSelected([]);
      setMessage("");
      if (newFound.length === 4) {
        setStatus("won");
      }
      return;
    }

    const counts = {};
    selected.forEach((t) => (counts[t.tier] = (counts[t.tier] || 0) + 1));
    const maxCount = Math.max(...Object.values(counts));

    setShakeIds(selected.map((t) => t.id));
    setTimeout(() => setShakeIds([]), 500);

    const nextMistakes = mistakes + 1;
    setMistakes(nextMistakes);

    if (hintsOn && maxCount === 3) {
      setMessage("Nesten — ett ord er feil.");
    } else {
      setMessage("Ikke riktig gruppe.");
    }

    if (nextMistakes >= maxMistakes) {
      setStatus("lost");
      setFound([0, 1, 2, 3]);
      setSelected([]);
    }
  };

  const saveScore = async () => {
    if (!supabase || !nickname.trim() || finalTimeRef.current === null) return;
    setSaving(true);
    const { error } = await supabase.from("scores").insert({
      nickname: nickname.trim().slice(0, 24),
      difficulty,
      time_seconds: Math.round(finalTimeRef.current / 100) / 10,
      mistakes,
    });
    setSaving(false);
    if (!error) setScoreSaved(true);
  };

  const loadLeaderboard = useCallback(async (level) => {
    if (!supabase) return;
    setScoresLoading(true);
    const { data, error } = await supabase
      .from("scores")
      .select("nickname, time_seconds, mistakes, created_at")
      .eq("difficulty", level)
      .order("time_seconds", { ascending: true })
      .limit(10);
    setScoresLoading(false);
    if (!error && data) setScores(data);
  }, []);

  useEffect(() => {
    if (showLeaderboard) loadLeaderboard(leaderboardDifficulty);
  }, [showLeaderboard, leaderboardDifficulty, loadLeaderboard]);

  const gridCols =
    remainingTiles.length >= 12
      ? 4
      : remainingTiles.length >= 6
      ? Math.min(4, remainingTiles.length)
      : Math.max(1, remainingTiles.length);

  return (
    <PageShell>
      <div style={shared.header}>
        <Link to="/" style={styles.backLink}>
          ← Fellesnevner
        </Link>
        <h1 style={shared.title}>Ordspill</h1>
        <p style={shared.subtitle}>
          Finn fellesnevneren i {puzzle.theme.toLowerCase()} — fire ord, fire kategorier.
        </p>
      </div>

        <div style={styles.difficultyRow}>
          {Object.entries(DIFFICULTY).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => changeDifficulty(key)}
              className="rt-btn"
              style={{
                ...styles.diffPill,
                background: difficulty === key ? "rgba(232,193,90,0.18)" : "transparent",
                color: difficulty === key ? "#E8C15A" : "#B9C4B4",
                borderColor: difficulty === key ? "#E8C15A" : "rgba(237,237,224,0.3)",
              }}
            >
              {cfg.label}
            </button>
          ))}
        </div>

        <div style={styles.metaRow}>
          <span style={styles.metaText}>
            Runde {gamesPlayed} · {formatTime(elapsedMs)}
          </span>
          <TallyMarks max={maxMistakes} count={mistakes} />
        </div>

        {found.length > 0 && (
          <div style={styles.foundWrap}>
            {found
              .slice()
              .sort((a, b) => a - b)
              .map((tier, i) => {
                const group = puzzle.groups[tier];
                const color = TIER_COLORS[tier];
                return (
                  <FractionReveal
                    key={tier}
                    words={group.words}
                    label={group.label}
                    color={color.chalk}
                    delay={i * 60}
                  />
                );
              })}
          </div>
        )}

        {status === "playing" && remainingTiles.length > 0 && (
          <div style={{ ...styles.grid, gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
            {remainingTiles.map((tile) => {
              const isSelected = selected.some((t) => t.id === tile.id);
              const isShaking = shakeIds.includes(tile.id);
              const tilt = tileTilt(tile.word);
              return (
                <button
                  key={tile.id}
                  onClick={() => toggleTile(tile)}
                  className={`rt-tile${isShaking ? " rt-shake" : ""}`}
                  style={{
                    ...styles.tile,
                    "--tilt": `${tilt}deg`,
                    transform: `rotate(${tilt}deg)`,
                    background: isSelected ? "rgba(232,193,90,0.14)" : "rgba(237,237,224,0.03)",
                    borderColor: isSelected ? "#E8C15A" : "rgba(237,237,224,0.4)",
                    color: "#EDEDE0",
                  }}
                >
                  {tile.word}
                </button>
              );
            })}
          </div>
        )}

        <div style={styles.messageRow}>{message && <span style={styles.message}>{message}</span>}</div>

        {status === "playing" && (
          <div style={styles.controls}>
            <button style={{ ...styles.btn, ...styles.btnGhost }} className="rt-btn" onClick={doShuffle}>
              <Shuffle size={16} style={{ marginRight: 6 }} /> Stokk
            </button>
            <button
              style={{ ...styles.btn, ...styles.btnGhost }}
              className="rt-btn"
              onClick={deselect}
              disabled={selected.length === 0}
            >
              <X size={16} style={{ marginRight: 6 }} /> Nullstill valg
            </button>
            <button
              style={{
                ...styles.btn,
                ...styles.btnPrimary,
                opacity: selected.length === 4 ? 1 : 0.5,
                cursor: selected.length === 4 ? "pointer" : "default",
              }}
              className="rt-btn"
              onClick={submit}
              disabled={selected.length !== 4}
            >
              Lever svar
            </button>
          </div>
        )}

        {status !== "playing" && (
          <div style={styles.endBanner}>
            <p style={styles.endText}>
              {status === "won"
                ? `Løst på ${formatTime(finalTimeRef.current ?? elapsedMs)}${
                    mistakes === 0 ? " uten en eneste feil!" : ` med ${mistakes} feil.`
                  }`
                : "Ikke denne gangen — her er svarene."}
            </p>

            {status === "won" && supabase && !scoreSaved && (
              <div style={styles.saveRow}>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Kallenavn"
                  maxLength={24}
                  style={styles.input}
                />
                <button
                  style={{ ...styles.btn, ...styles.btnPrimary, opacity: nickname.trim() ? 1 : 0.5 }}
                  className="rt-btn"
                  onClick={saveScore}
                  disabled={!nickname.trim() || saving}
                >
                  {saving ? "Lagrer…" : "Lagre tid"}
                </button>
              </div>
            )}
            {status === "won" && scoreSaved && (
              <p style={{ color: "#8FC98A", fontSize: 13, marginBottom: 8 }}>Tiden er lagret på topplisten!</p>
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
                <RotateCcw size={16} style={{ marginRight: 6 }} /> Nytt spill
              </button>
              {supabase && (
                <button
                  style={{ ...styles.btn, ...styles.btnGhost }}
                  className="rt-btn"
                  onClick={() => setShowLeaderboard(true)}
                >
                  <Trophy size={16} style={{ marginRight: 6 }} /> Topplisten
                </button>
              )}
            </div>
          </div>
        )}

        {status === "playing" && supabase && (
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              style={{ ...styles.btn, ...styles.btnGhost, fontSize: 12, padding: "8px 16px" }}
              className="rt-btn"
              onClick={() => setShowLeaderboard(true)}
            >
              <Trophy size={14} style={{ marginRight: 6 }} /> Se topplisten
            </button>
          </div>
        )}

        {showLeaderboard && (
          <div style={styles.modalOverlay} onClick={() => setShowLeaderboard(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h2 style={styles.modalTitle}>Topplisten — raskeste tid</h2>
                <button style={styles.closeBtn} onClick={() => setShowLeaderboard(false)}>
                  <X size={18} />
                </button>
              </div>
              <div style={styles.difficultyRow}>
                {Object.entries(DIFFICULTY).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setLeaderboardDifficulty(key)}
                    className="rt-btn"
                    style={{
                      ...styles.diffPill,
                      background: leaderboardDifficulty === key ? "rgba(232,193,90,0.18)" : "transparent",
                      color: leaderboardDifficulty === key ? "#E8C15A" : "#B9C4B4",
                      borderColor: leaderboardDifficulty === key ? "#E8C15A" : "rgba(237,237,224,0.3)",
                    }}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
              {scoresLoading && <p style={{ color: "#B9C4B4", fontSize: 13 }}>Laster…</p>}
              {!scoresLoading && scores.length === 0 && (
                <p style={{ color: "#B9C4B4", fontSize: 13 }}>Ingen tider registrert enda for dette nivået.</p>
              )}
              {!scoresLoading && scores.length > 0 && (
                <ol style={styles.leaderboardList}>
                  {scores.map((s, i) => (
                    <li key={i} style={styles.leaderboardItem}>
                      <span style={styles.rank}>{i + 1}</span>
                      <span style={styles.leaderboardName}>{s.nickname}</span>
                      <span style={styles.leaderboardTime}>{s.time_seconds}s</span>
                    </li>
                  ))}
                </ol>
              )}
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
  difficultyRow: { display: "flex", justifyContent: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" },
  diffPill: {
    border: "1.5px solid",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    minHeight: 36,
    WebkitTapHighlightColor: "transparent",
  },
  metaRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  metaText: { color: "#8FA089", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" },
  foundWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginBottom: 14,
  },
  revealItem: { textAlign: "center" },
  revealWords: {
    color: "#EDEDE0",
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: "clamp(11px, 2.8vw, 13px)",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  revealLabel: {
    fontFamily: "'Kalam', cursive",
    fontSize: "clamp(15px, 3.6vw, 18px)",
    fontWeight: 700,
    marginTop: 2,
  },
  grid: { display: "grid", gap: "clamp(6px, 2vw, 10px)", marginTop: 4 },
  tile: {
    border: "2px dashed",
    borderRadius: "9px 6px 8px 5px",
    padding: "clamp(12px, 3vw, 18px) 6px",
    fontSize: "clamp(11px, 2.6vw, 13.5px)",
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    letterSpacing: 0.3,
    textAlign: "center",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
    minHeight: "clamp(56px, 15vw, 66px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
  },
  messageRow: { minHeight: 24, textAlign: "center", marginTop: 10 },
  message: { color: "#E8C15A", fontSize: 13, fontWeight: 500, fontFamily: "'IBM Plex Sans', sans-serif" },
  controls: { display: "flex", gap: 8, marginTop: 6, justifyContent: "center", flexWrap: "wrap" },
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
    transition: "filter 0.15s, transform 0.05s",
    minHeight: 44,
    WebkitTapHighlightColor: "transparent",
  },
  btnGhost: {
    background: "transparent",
    border: "1.5px dashed rgba(237,237,224,0.4)",
    color: "#EDEDE0",
    cursor: "pointer",
  },
  btnPrimary: { background: "#E8C15A", color: "#16221A" },
  endBanner: { textAlign: "center", marginTop: 16 },
  endText: { color: "#EDEDE0", fontSize: 14, marginBottom: 10, fontFamily: "'IBM Plex Sans', sans-serif" },
  saveRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" },
  input: {
    background: "rgba(237,237,224,0.05)",
    border: "1.5px dashed rgba(237,237,224,0.4)",
    borderRadius: 8,
    padding: "12px 16px",
    color: "#EDEDE0",
    fontSize: 16,
    fontFamily: "'IBM Plex Sans', sans-serif",
    outline: "none",
    maxWidth: 160,
    minHeight: 44,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding:
      "max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))",
    zIndex: 50,
  },
  modal: {
    background: "#1C2A20",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: "clamp(320px, 90vw, 420px)",
    maxHeight: "80vh",
    overflowY: "auto",
    border: "2px dashed rgba(237,237,224,0.3)",
  },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  modalTitle: { fontFamily: "'Kalam', cursive", fontSize: 20, fontWeight: 700, color: "#EDEDE0", margin: 0 },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#B9C4B4",
    cursor: "pointer",
    padding: 10,
    minWidth: 44,
    minHeight: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
  },
  leaderboardList: { listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 },
  leaderboardItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(237,237,224,0.04)",
    borderRadius: 8,
    padding: "8px 12px",
    fontFamily: "'IBM Plex Mono', monospace",
  },
  rank: { color: "#E8C15A", fontWeight: 700, fontSize: 13, width: 18 },
  leaderboardName: { color: "#EDEDE0", fontSize: 13.5, flex: 1, fontFamily: "'IBM Plex Sans', sans-serif" },
  leaderboardTime: { color: "#B9C4B4", fontSize: 13, fontWeight: 600 },
};
