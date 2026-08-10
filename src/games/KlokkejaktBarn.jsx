import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { usePageTitle } from "../theme";
import { kidColors, kidShared } from "../themeKids";

const ROUND_LENGTH = 8;

const LEVELS = {
  trinn1: { label: "1. trinn", minutes: [0] },
  trinn2: { label: "2. trinn", minutes: [0, 30] },
  trinn3: { label: "3. trinn", minutes: [0, 15, 30, 45] },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(hour, minute) {
  return `${hour}:${minute.toString().padStart(2, "0")}`;
}

function ClockFace({ hour, minute, size = 200 }) {
  const minuteAngle = minute * 6;
  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const cx = 100;
  const cy = 100;

  const handEnd = (angleDeg, length) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + length * Math.cos(rad), y: cy + length * Math.sin(rad) };
  };
  const hourEnd = handEnd(hourAngle, 50);
  const minuteEnd = handEnd(minuteAngle, 75);

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30;
    const outer = handEnd(angle, 88);
    const inner = handEnd(angle, 78);
    return (
      <line
        key={i}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke="#EDEDE0"
        strokeWidth={i % 3 === 0 ? 4 : 2}
      />
    );
  });

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx={cx} cy={cy} r="94" fill="rgba(237,237,224,0.06)" stroke="#EDEDE0" strokeWidth="5" />
      {ticks}
      <line x1={cx} y1={cy} x2={hourEnd.x} y2={hourEnd.y} stroke="#EDEDE0" strokeWidth="8" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={minuteEnd.x} y2={minuteEnd.y} stroke={kidColors.sun} strokeWidth="6" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="7" fill={kidColors.berry} />
    </svg>
  );
}

function allTimesFor(level) {
  const cfg = LEVELS[level];
  const times = [];
  for (let h = 1; h <= 12; h++) {
    for (const m of cfg.minutes) {
      times.push({ hour: h, minute: m, answer: formatTime(h, m) });
    }
  }
  return times;
}

function buildOneProblem(level, target, allTimes) {
  const wrongs = shuffle(allTimes.filter((t) => t.answer !== target.answer)).slice(0, 3);
  const options = shuffle([target.answer, ...wrongs.map((w) => w.answer)]);
  return { hour: target.hour, minute: target.minute, answer: target.answer, options };
}

// Every possible time for a level is enumerated once, shuffled, and the
// round takes the first ROUND_LENGTH of them — since there are always
// more possible times than questions in a round, no time can repeat.
function buildRound(level) {
  const allTimes = allTimesFor(level);
  const targets = shuffle(allTimes).slice(0, ROUND_LENGTH);
  return targets.map((t) => buildOneProblem(level, t, allTimes));
}

export default function KlokkejaktBarn() {
  usePageTitle("Klokkejakt for barn");
  const [level, setLevel] = useState("trinn1");
  const [qIndex, setQIndex] = useState(0);
  const [round, setRound] = useState(() => buildRound("trinn1"));
  const [feedback, setFeedback] = useState(null);
  const [wrongPick, setWrongPick] = useState(null);
  const [stars, setStars] = useState(0);
  const [status, setStatus] = useState("playing");

  const problem = round[qIndex];

  const changeLevel = (lvl) => {
    setLevel(lvl);
    setQIndex(0);
    setRound(buildRound(lvl));
    setFeedback(null);
    setWrongPick(null);
    setStars(0);
    setStatus("playing");
  };

  const startOver = useCallback(() => changeLevel(level), [level]);

  const pick = (opt) => {
    if (feedback === "correct") return;
    if (opt === problem.answer) {
      setFeedback("correct");
      setStars((s) => s + 1);
      setTimeout(() => {
        setFeedback(null);
        setWrongPick(null);
        if (qIndex + 1 >= ROUND_LENGTH) {
          setStatus("done");
        } else {
          setQIndex((i) => i + 1);
        }
      }, 800);
    } else {
      setFeedback("wrong");
      setWrongPick(opt);
      setTimeout(() => {
        setFeedback(null);
        setWrongPick(null);
      }, 600);
    }
  };

  return (
    <div style={kidShared.page}>
      <div style={kidShared.container}>
        <div style={kidShared.header}>
          <Link to="/barn" style={kidShared.backLink}>
            ← Fellesnevner for barn
          </Link>
          <h1 style={kidShared.title}>Klokkejakt 🕐</h1>
          <p style={kidShared.subtitle}>Hva er klokka?</p>
        </div>

        <div style={styles.levelRow}>
          {Object.entries(LEVELS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => changeLevel(key)}
              style={{
                ...styles.levelBtn,
                background: level === key ? kidColors.tangerine : "transparent",
                color: level === key ? "#16221A" : "#EDEDE0",
                borderColor: level === key ? kidColors.tangerine : "rgba(237,237,224,0.4)",
              }}
            >
              {c.label}
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
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <ClockFace hour={problem.hour} minute={problem.minute} />
            </div>

            <div style={styles.optionGrid}>
              {problem.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => pick(opt)}
                  style={{
                    ...styles.optionBtn,
                    borderColor:
                      feedback === "wrong" && wrongPick === opt
                        ? kidColors.berry
                        : feedback === "correct" && opt === problem.answer
                        ? kidColors.grass
                        : "rgba(237,237,224,0.3)",
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback === "correct" && <p style={styles.feedbackText}>Riktig! Bra jobba! 🎉</p>}
            {feedback === "wrong" && <p style={{ ...styles.feedbackText, color: kidColors.berry }}>Prøv igjen! 💪</p>}
          </div>
        )}

        {status === "done" && (
          <div style={{ ...kidShared.card, textAlign: "center" }}>
            <p style={styles.doneEmoji}>🏆</p>
            <p style={styles.doneText}>
              Du fikk {stars} av {ROUND_LENGTH} stjerner!
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
  optionGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 320, margin: "0 auto" },
  optionBtn: {
    border: "3px solid",
    borderRadius: 16,
    background: "rgba(237,237,224,0.06)",
    color: "#EDEDE0",
    padding: "16px 10px",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 22,
    cursor: "pointer",
    minHeight: 56,
  },
  feedbackText: {
    fontFamily: "'Kalam', cursive",
    fontSize: 22,
    fontWeight: 700,
    color: "#6FCF6F",
    marginTop: 18,
  },
  doneEmoji: { fontSize: 64, margin: "0 0 10px" },
  doneText: { fontFamily: "'Kalam', cursive", fontSize: 26, fontWeight: 700, color: "#EDEDE0", marginBottom: 20 },
  againBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 18,
    background: "#FF9F5A",
    color: "#16221A",
    fontFamily: "'Kalam', cursive",
    fontWeight: 700,
    fontSize: 20,
    padding: "16px 28px",
    minHeight: 56,
    cursor: "pointer",
  },
};
