import { useState, useCallback, useEffect } from "react";
import { Trophy, X } from "lucide-react";
import { supabase } from "../supabaseClient";
import { colors } from "../theme";

// Inline nickname input + save button, meant to sit inside a game's
// end-of-round banner right after the result is known. Renders nothing
// if Supabase isn't configured (e.g. running locally without .env yet).
export function SaveScoreRow({ game, difficulty, score }) {
  const [nickname, setNickname] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!supabase) return null;

  const save = async () => {
    if (!nickname.trim() || saving) return;
    setSaving(true);
    const { error } = await supabase.from("scores").insert({
      game,
      nickname: nickname.trim().slice(0, 24),
      difficulty,
      score,
    });
    setSaving(false);
    if (!error) setSaved(true);
  };

  if (saved) {
    return <p style={styles.savedText}>Resultatet er lagret på topplisten!</p>;
  }

  return (
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
  );
}

// Trophy button that opens a modal with per-difficulty top-10. Pass
// ascending=true when a lower score is better (guesses, time), false when
// higher is better (correct answers, points). `unit` is appended after the
// number, e.g. " forsøk" or " riktige".
export default function Leaderboard({ game, difficulties, initialDifficulty, ascending, unit = "" }) {
  const [open, setOpen] = useState(false);
  const [diff, setDiff] = useState(initialDifficulty);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    async (level) => {
      if (!supabase) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("scores")
        .select("nickname, score, created_at")
        .eq("game", game)
        .eq("difficulty", level)
        .order("score", { ascending })
        .limit(10);
      setLoading(false);
      if (!error && data) setScores(data);
    },
    [game, ascending]
  );

  useEffect(() => {
    if (open) load(diff);
  }, [open, diff, load]);

  if (!supabase) return null;

  const diffEntries = Object.entries(difficulties);
  const showTabs = diffEntries.length > 1;

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

            {showTabs && (
              <div style={styles.difficultyRow}>
                {diffEntries.map(([key, c]) => (
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
            )}

            {loading && <p style={{ color: "#B9C4B4", fontSize: 13 }}>Laster…</p>}
            {!loading && scores.length === 0 && (
              <p style={{ color: "#B9C4B4", fontSize: 13 }}>Ingen resultater registrert enda for dette nivået.</p>
            )}
            {!loading && scores.length > 0 && (
              <ol style={styles.leaderboardList}>
                {scores.map((s, i) => (
                  <li key={i} style={styles.leaderboardItem}>
                    <span style={styles.rank}>{i + 1}</span>
                    <span style={styles.leaderboardName}>{s.nickname}</span>
                    <span style={styles.leaderboardScore}>
                      {s.score}
                      {unit}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  saveRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 10, flexWrap: "wrap" },
  savedText: { color: "#8FC98A", fontSize: 13, marginBottom: 8 },
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
};
