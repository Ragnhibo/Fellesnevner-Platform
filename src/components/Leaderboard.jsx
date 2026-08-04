import { useState, useCallback, useEffect } from "react";
import { Trophy, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { colors } from "../theme";

// Inline nickname input + save button, meant to sit inside a game's
// end-of-round banner right after the result is known. Renders nothing
// if Supabase isn't configured (e.g. running locally without .env yet).
export function SaveScoreRow({ game, difficulty, score, timeSeconds }) {
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!supabase) return null;

  const save = async () => {
    if (!nickname.trim() || saving) return;
    setSaving(true);
    setErrorMsg("");
    const payload = {
      game,
      nickname: nickname.trim().slice(0, 24),
      difficulty,
      score,
    };
    if (timeSeconds !== undefined && timeSeconds !== null) {
      payload.time_seconds = timeSeconds;
    }
    const { error } = await supabase.from("scores").insert(payload);
    setSaving(false);
    if (error) {
      setErrorMsg(error.message || "Ukjent feil ved lagring.");
    } else {
      setSaved(true);
    }
  };

  if (saved) {
    return <p style={styles.savedText}>Resultatet er lagret på topplisten!</p>;
  }

  return (
    <div>
      <div style={styles.saveRow}>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="Kallenavn"
          maxLength={24}
          style={styles.input}
        />
        <button
          style={{ ...styles.btn, ...styles.btnPrimary, opacity: nickname.trim() ? 1 : 0.5 }}
          className="rt-btn"
          onClick={save}
          disabled={!nickname.trim() || saving}
        >
          {saving ? "Lagrer…" : "Lagre"}
        </button>
      </div>
      {errorMsg && <p style={styles.errorText}>Kunne ikke lagre: {errorMsg}</p>}
    </div>
  );
}

function useLeaderboardScores(game, difficulty, ascending, showTime, metric) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!supabase || !difficulty) return;
    setLoading(true);
    let query = supabase
      .from("scores")
      .select(metric === "time" ? "nickname, time_seconds, created_at" : showTime ? "nickname, score, time_seconds, created_at" : "nickname, score, created_at")
      .eq("game", game)
      .eq("difficulty", difficulty);
    if (metric === "time") {
      query = query.order("time_seconds", { ascending: true });
    } else {
      query = query.order("score", { ascending });
      if (showTime) query = query.order("time_seconds", { ascending: true, nullsFirst: false });
    }
    const { data, error } = await query.limit(10);
    setLoading(false);
    if (!error && data) setScores(data);
  }, [game, difficulty, ascending, showTime, metric]);

  useEffect(() => {
    load();
  }, [load]);

  return { scores, loading };
}

function DifficultyTabs({ difficulties, diff, setDiff }) {
  const entries = Object.entries(difficulties);
  if (entries.length <= 1) return null;
  return (
    <div style={styles.difficultyRow}>
      {entries.map(([key, c]) => (
        <button
          key={key}
          onClick={() => setDiff(key)}
          className="rt-btn"
          style={{
            ...styles.diffPill,
            background: diff === key ? "rgba(232,193,90,0.18)" : "transparent",
            color: diff === key ? colors.accent : colors.chalkMuted,
            borderColor: diff === key ? colors.accent : "rgba(237,237,224,0.3)",
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function ScoreList({ scores, loading, unit, showTime, metric }) {
  if (loading) return <p style={{ color: "#B9C4B4", fontSize: 13 }}>Laster…</p>;
  if (scores.length === 0) {
    return <p style={{ color: "#B9C4B4", fontSize: 13 }}>Ingen resultater registrert enda for dette nivået.</p>;
  }
  return (
    <ol style={styles.leaderboardList}>
      {scores.map((s, i) => (
        <li key={i} style={styles.leaderboardItem}>
          <span style={styles.rank}>{i + 1}</span>
          <span style={styles.leaderboardName}>{s.nickname}</span>
          <span style={styles.leaderboardScore}>
            {metric === "time" ? (
              formatTime(s.time_seconds)
            ) : (
              <>
                {s.score}
                {unit}
                {showTime && s.time_seconds != null && (
                  <span style={styles.leaderboardTime}> · {formatTime(s.time_seconds)}</span>
                )}
              </>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}

function formatTime(seconds) {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

// Bare list (tabs + top-10), no trophy button or modal chrome — for
// embedding directly on a page, e.g. an all-games "Topplister" overview.
export function LeaderboardList({ game, difficulties, initialDifficulty, ascending, unit = "", showTime = false, metric = "score" }) {
  const [diff, setDiff] = useState(initialDifficulty);
  const { scores, loading } = useLeaderboardScores(game, diff, ascending, showTime, metric);

  if (!supabase) return null;

  return (
    <div>
      <DifficultyTabs difficulties={difficulties} diff={diff} setDiff={setDiff} />
      <ScoreList scores={scores} loading={loading} unit={unit} showTime={showTime} metric={metric} />
    </div>
  );
}

// Trophy button that opens a modal with per-difficulty top-10. Pass
// ascending=true when a lower score is better (guesses, time), false when
// higher is better (correct answers, points). `unit` is appended after the
// number, e.g. " forsøk" or " riktige". Pass metric="time" for games (like
// Ordspill) whose primary ranking is completion time rather than a score.
export default function Leaderboard({ game, difficulties, initialDifficulty, ascending, unit = "", showTime = false, metric = "score" }) {
  const [open, setOpen] = useState(false);
  const [diff, setDiff] = useState(initialDifficulty);
  const { scores, loading } = useLeaderboardScores(game, open ? diff : null, ascending, showTime, metric);

  if (!supabase) return null;

  return (
    <>
      <button style={{ ...styles.btn, ...styles.btnGhost }} className="rt-btn" onClick={() => setOpen(true)}>
        <Trophy size={16} style={{ marginRight: 6 }} /> Topplisten
      </button>
      {open && (
        <div style={styles.modalOverlay} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Topplisten</h2>
              <button style={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Lukk">
                <X size={18} />
              </button>
            </div>
            <DifficultyTabs difficulties={difficulties} diff={diff} setDiff={setDiff} />
            <ScoreList scores={scores} loading={loading} unit={unit} showTime={showTime} metric={metric} />
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  saveRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" },
  savedText: { color: "#8FC98A", fontSize: 13, marginBottom: 8 },
  errorText: { color: "#D98FA0", fontSize: 12.5, marginTop: 6, marginBottom: 4 },
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
  difficultyRow: { display: "flex", justifyContent: "center", gap: 6, marginBottom: 14, flexWrap: "wrap" },
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
  leaderboardScore: { color: "#B9C4B4", fontSize: 13, fontWeight: 600 },
  leaderboardTime: { color: "#8FA089", fontWeight: 500 },
};
