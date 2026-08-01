import React, { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { RotateCcw, Share2 } from "lucide-react";
import { shared, colors, usePageTitle, copyToClipboard } from "../theme";
import PageShell from "../components/PageShell";

// A broad, hand-checked list of country/capital pairs, in Norwegian.
// "common" marks countries used in "Lett" mode — larger, more widely
// known countries, so beginners aren't hit with obscure capitals right
// away. A handful of countries have genuinely disputed or multi-capital
// arrangements (Bolivia, South Africa, Israel/Palestine, Kosovo, Taiwan)
// — the list uses the answer most commonly taught in general geography
// contexts, not a political statement.
const COUNTRIES = [
  { country: "Norge", capital: "Oslo", common: true },
  { country: "Sverige", capital: "Stockholm", common: true },
  { country: "Danmark", capital: "København", common: true },
  { country: "Finland", capital: "Helsingfors", common: true },
  { country: "Island", capital: "Reykjavik", common: true },
  { country: "Storbritannia", capital: "London", common: true },
  { country: "Irland", capital: "Dublin", common: true },
  { country: "Frankrike", capital: "Paris", common: true },
  { country: "Tyskland", capital: "Berlin", common: true },
  { country: "Nederland", capital: "Amsterdam", common: true },
  { country: "Belgia", capital: "Brussel", common: true },
  { country: "Luxembourg", capital: "Luxembourg", common: false },
  { country: "Sveits", capital: "Bern", common: true },
  { country: "Østerrike", capital: "Wien", common: true },
  { country: "Spania", capital: "Madrid", common: true },
  { country: "Portugal", capital: "Lisboa", common: true },
  { country: "Italia", capital: "Roma", common: true },
  { country: "Hellas", capital: "Athen", common: true },
  { country: "Polen", capital: "Warszawa", common: true },
  { country: "Tsjekkia", capital: "Praha", common: true },
  { country: "Slovakia", capital: "Bratislava", common: false },
  { country: "Ungarn", capital: "Budapest", common: true },
  { country: "Romania", capital: "Bucuresti", common: true },
  { country: "Bulgaria", capital: "Sofia", common: false },
  { country: "Kroatia", capital: "Zagreb", common: true },
  { country: "Slovenia", capital: "Ljubljana", common: false },
  { country: "Serbia", capital: "Beograd", common: true },
  { country: "Bosnia-Hercegovina", capital: "Sarajevo", common: false },
  { country: "Montenegro", capital: "Podgorica", common: false },
  { country: "Nord-Makedonia", capital: "Skopje", common: false },
  { country: "Albania", capital: "Tirana", common: false },
  { country: "Kosovo", capital: "Pristina", common: false },
  { country: "Estland", capital: "Tallinn", common: true },
  { country: "Latvia", capital: "Riga", common: true },
  { country: "Litauen", capital: "Vilnius", common: true },
  { country: "Ukraina", capital: "Kyiv", common: true },
  { country: "Hviterussland", capital: "Minsk", common: false },
  { country: "Moldova", capital: "Chisinau", common: false },
  { country: "Russland", capital: "Moskva", common: true },
  { country: "Malta", capital: "Valletta", common: false },
  { country: "Kypros", capital: "Nikosia", common: false },
  { country: "Monaco", capital: "Monaco", common: false },
  { country: "San Marino", capital: "San Marino", common: false },
  { country: "Andorra", capital: "Andorra la Vella", common: false },
  { country: "Liechtenstein", capital: "Vaduz", common: false },
  { country: "Kina", capital: "Beijing", common: true },
  { country: "Japan", capital: "Tokyo", common: true },
  { country: "Sør-Korea", capital: "Seoul", common: true },
  { country: "Nord-Korea", capital: "Pyongyang", common: true },
  { country: "Taiwan", capital: "Taipei", common: false },
  { country: "India", capital: "New Delhi", common: true },
  { country: "Pakistan", capital: "Islamabad", common: true },
  { country: "Bangladesh", capital: "Dhaka", common: false },
  { country: "Sri Lanka", capital: "Colombo", common: false },
  { country: "Nepal", capital: "Kathmandu", common: false },
  { country: "Bhutan", capital: "Thimphu", common: false },
  { country: "Myanmar", capital: "Naypyidaw", common: false },
  { country: "Thailand", capital: "Bangkok", common: true },
  { country: "Vietnam", capital: "Hanoi", common: true },
  { country: "Laos", capital: "Vientiane", common: false },
  { country: "Kambodsja", capital: "Phnom Penh", common: false },
  { country: "Malaysia", capital: "Kuala Lumpur", common: true },
  { country: "Singapore", capital: "Singapore", common: true },
  { country: "Indonesia", capital: "Jakarta", common: true },
  { country: "Filippinene", capital: "Manila", common: true },
  { country: "Brunei", capital: "Bandar Seri Begawan", common: false },
  { country: "Øst-Timor", capital: "Dili", common: false },
  { country: "Mongolia", capital: "Ulaanbaatar", common: false },
  { country: "Kasakhstan", capital: "Astana", common: false },
  { country: "Usbekistan", capital: "Tasjkent", common: false },
  { country: "Turkmenistan", capital: "Asjkhabad", common: false },
  { country: "Kirgisistan", capital: "Bisjkek", common: false },
  { country: "Tadsjikistan", capital: "Dusjanbe", common: false },
  { country: "Afghanistan", capital: "Kabul", common: true },
  { country: "Iran", capital: "Teheran", common: true },
  { country: "Irak", capital: "Bagdad", common: true },
  { country: "Syria", capital: "Damaskus", common: true },
  { country: "Libanon", capital: "Beirut", common: false },
  { country: "Jordan", capital: "Amman", common: false },
  { country: "Israel", capital: "Jerusalem", common: true },
  { country: "Palestina", capital: "Ramallah", common: false },
  { country: "Saudi-Arabia", capital: "Riyadh", common: true },
  { country: "Yemen", capital: "Sanaa", common: false },
  { country: "Oman", capital: "Muskat", common: false },
  { country: "De forente arabiske emirater", capital: "Abu Dhabi", common: true },
  { country: "Qatar", capital: "Doha", common: false },
  { country: "Bahrain", capital: "Manama", common: false },
  { country: "Kuwait", capital: "Kuwait", common: false },
  { country: "Tyrkia", capital: "Ankara", common: true },
  { country: "Georgia", capital: "Tbilisi", common: false },
  { country: "Armenia", capital: "Jerevan", common: false },
  { country: "Aserbajdsjan", capital: "Baku", common: false },
  { country: "Egypt", capital: "Kairo", common: true },
  { country: "Libya", capital: "Tripoli", common: false },
  { country: "Tunisia", capital: "Tunis", common: false },
  { country: "Algerie", capital: "Alger", common: false },
  { country: "Marokko", capital: "Rabat", common: true },
  { country: "Mauritania", capital: "Nouakchott", common: false },
  { country: "Mali", capital: "Bamako", common: false },
  { country: "Niger", capital: "Niamey", common: false },
  { country: "Tsjad", capital: "N'Djamena", common: false },
  { country: "Sudan", capital: "Khartoum", common: false },
  { country: "Sør-Sudan", capital: "Juba", common: false },
  { country: "Etiopia", capital: "Addis Abeba", common: true },
  { country: "Eritrea", capital: "Asmara", common: false },
  { country: "Djibouti", capital: "Djibouti", common: false },
  { country: "Somalia", capital: "Mogadishu", common: false },
  { country: "Kenya", capital: "Nairobi", common: true },
  { country: "Uganda", capital: "Kampala", common: false },
  { country: "Tanzania", capital: "Dodoma", common: false },
  { country: "Rwanda", capital: "Kigali", common: false },
  { country: "Burundi", capital: "Gitega", common: false },
  { country: "Den demokratiske republikken Kongo", capital: "Kinshasa", common: false },
  { country: "Republikken Kongo", capital: "Brazzaville", common: false },
  { country: "Den sentralafrikanske republikk", capital: "Bangui", common: false },
  { country: "Kamerun", capital: "Yaoundé", common: false },
  { country: "Nigeria", capital: "Abuja", common: true },
  { country: "Benin", capital: "Porto-Novo", common: false },
  { country: "Togo", capital: "Lomé", common: false },
  { country: "Ghana", capital: "Accra", common: true },
  { country: "Elfenbenskysten", capital: "Yamoussoukro", common: false },
  { country: "Liberia", capital: "Monrovia", common: false },
  { country: "Sierra Leone", capital: "Freetown", common: false },
  { country: "Guinea", capital: "Conakry", common: false },
  { country: "Guinea-Bissau", capital: "Bissau", common: false },
  { country: "Senegal", capital: "Dakar", common: false },
  { country: "Gambia", capital: "Banjul", common: false },
  { country: "Burkina Faso", capital: "Ouagadougou", common: false },
  { country: "Kapp Verde", capital: "Praia", common: false },
  { country: "Angola", capital: "Luanda", common: false },
  { country: "Zambia", capital: "Lusaka", common: false },
  { country: "Zimbabwe", capital: "Harare", common: false },
  { country: "Mosambik", capital: "Maputo", common: false },
  { country: "Malawi", capital: "Lilongwe", common: false },
  { country: "Namibia", capital: "Windhoek", common: false },
  { country: "Botswana", capital: "Gaborone", common: false },
  { country: "Sør-Afrika", capital: "Pretoria", common: true },
  { country: "Eswatini", capital: "Mbabane", common: false },
  { country: "Lesotho", capital: "Maseru", common: false },
  { country: "Madagaskar", capital: "Antananarivo", common: false },
  { country: "Mauritius", capital: "Port Louis", common: false },
  { country: "Komorene", capital: "Moroni", common: false },
  { country: "Seychellene", capital: "Victoria", common: false },
  { country: "Sao Tome og Principe", capital: "São Tomé", common: false },
  { country: "Gabon", capital: "Libreville", common: false },
  { country: "Ekvatorial-Guinea", capital: "Malabo", common: false },
  { country: "USA", capital: "Washington D.C.", common: true },
  { country: "Canada", capital: "Ottawa", common: true },
  { country: "Mexico", capital: "Mexico by", common: true },
  { country: "Guatemala", capital: "Guatemala by", common: false },
  { country: "Belize", capital: "Belmopan", common: false },
  { country: "Honduras", capital: "Tegucigalpa", common: false },
  { country: "El Salvador", capital: "San Salvador", common: false },
  { country: "Nicaragua", capital: "Managua", common: false },
  { country: "Costa Rica", capital: "San José", common: false },
  { country: "Panama", capital: "Panama by", common: false },
  { country: "Cuba", capital: "Havana", common: true },
  { country: "Jamaica", capital: "Kingston", common: false },
  { country: "Haiti", capital: "Port-au-Prince", common: false },
  { country: "Den dominikanske republikk", capital: "Santo Domingo", common: false },
  { country: "Bahamas", capital: "Nassau", common: false },
  { country: "Trinidad og Tobago", capital: "Port of Spain", common: false },
  { country: "Barbados", capital: "Bridgetown", common: false },
  { country: "Colombia", capital: "Bogotá", common: true },
  { country: "Venezuela", capital: "Caracas", common: true },
  { country: "Guyana", capital: "Georgetown", common: false },
  { country: "Surinam", capital: "Paramaribo", common: false },
  { country: "Ecuador", capital: "Quito", common: false },
  { country: "Peru", capital: "Lima", common: true },
  { country: "Bolivia", capital: "Sucre", common: false },
  { country: "Chile", capital: "Santiago", common: true },
  { country: "Argentina", capital: "Buenos Aires", common: true },
  { country: "Paraguay", capital: "Asunción", common: false },
  { country: "Uruguay", capital: "Montevideo", common: false },
  { country: "Brasil", capital: "Brasília", common: true },
  { country: "Australia", capital: "Canberra", common: true },
  { country: "New Zealand", capital: "Wellington", common: true },
  { country: "Papua Ny-Guinea", capital: "Port Moresby", common: false },
  { country: "Fiji", capital: "Suva", common: false },
  { country: "Salomonøyene", capital: "Honiara", common: false },
  { country: "Vanuatu", capital: "Port Vila", common: false },
  { country: "Samoa", capital: "Apia", common: false },
  { country: "Tonga", capital: "Nuku'alofa", common: false },
  { country: "Kiribati", capital: "Tarawa", common: false },
  { country: "Palau", capital: "Ngerulmud", common: false },
  { country: "Marshalløyene", capital: "Majuro", common: false },
  { country: "Mikronesiaføderasjonen", capital: "Palikir", common: false },
  { country: "Nauru", capital: "Yaren", common: false },
  { country: "Tuvalu", capital: "Funafuti", common: false },
];

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

function normalize(s) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "");
}

function buildRound(pool, type) {
  const shuffled = shuffle(pool).slice(0, ROUND_LENGTH);
  return shuffled.map((entry) => {
    const direction = type === "mc" && Math.random() < 0.5 ? "capital-to-country" : "country-to-capital";
    if (type === "text") {
      return {
        type: "text",
        entry,
        prompt: `Hva er hovedstaden i ${entry.country}?`,
        answer: entry.capital,
      };
    }
    if (direction === "capital-to-country") {
      const wrongs = shuffle(pool.filter((e) => e.country !== entry.country)).slice(0, 3);
      const options = shuffle([entry.country, ...wrongs.map((w) => w.country)]);
      return {
        type: "mc",
        entry,
        prompt: `${entry.capital} er hovedstaden i hvilket land?`,
        answer: entry.country,
        options,
      };
    }
    const wrongs = shuffle(pool.filter((e) => e.capital !== entry.capital)).slice(0, 3);
    const options = shuffle([entry.capital, ...wrongs.map((w) => w.capital)]);
    return {
      type: "mc",
      entry,
      prompt: `Hva er hovedstaden i ${entry.country}?`,
      answer: entry.capital,
      options,
    };
  });
}

export default function Hovedstadsjakt() {
  usePageTitle("Hovedstadsjakt");
  const [difficulty, setDifficulty] = useState("middels");
  const pool = useMemo(
    () => (DIFFICULTY[difficulty].pool === "common" ? COUNTRIES.filter((c) => c.common) : COUNTRIES),
    [difficulty]
  );
  const [round, setRound] = useState(() => buildRound(pool, DIFFICULTY[difficulty].type));
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState([]); // array of booleans
  const [selectedOption, setSelectedOption] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null
  const [status, setStatus] = useState("playing"); // playing | done
  const [gamesPlayed, setGamesPlayed] = useState(1);
  const [shareCopied, setShareCopied] = useState(false);

  const current = round[qIndex];

  const resetRound = (level) => {
    const nextPool = DIFFICULTY[level].pool === "common" ? COUNTRIES.filter((c) => c.common) : COUNTRIES;
    setRound(buildRound(nextPool, DIFFICULTY[level].type));
    setQIndex(0);
    setResults([]);
    setSelectedOption(null);
    setTextAnswer("");
    setFeedback(null);
    setStatus("playing");
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

  const advance = (wasCorrect) => {
    const nextResults = [...results, wasCorrect];
    setResults(nextResults);
    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      setTextAnswer("");
      if (qIndex + 1 >= round.length) {
        setStatus("done");
      } else {
        setQIndex((i) => i + 1);
      }
    }, 1100);
  };

  const pickOption = (opt) => {
    if (feedback) return;
    const correct = opt === current.answer;
    setSelectedOption(opt);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct);
  };

  const submitText = () => {
    if (feedback || !textAnswer.trim()) return;
    const correct = normalize(textAnswer) === normalize(current.answer);
    setFeedback(correct ? "correct" : "wrong");
    advance(correct);
  };

  const shareResult = async () => {
    const correctCount = results.filter(Boolean).length;
    const grid = results.map((r) => (r ? "✅" : "❌")).join("");
    const text = `Hovedstadsjakt (${DIFFICULTY[difficulty].label}) — ${correctCount}/${ROUND_LENGTH}\n${grid}\nfellesnevner.no/hovedstadsjakt`;
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
        <h1 style={shared.title}>Hovedstadsjakt</h1>
        <p style={shared.subtitle}>Gjett verdens hovedsteder — {ROUND_LENGTH} spørsmål per runde.</p>
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
          <p style={styles.question}>{current.prompt}</p>

          {current.type === "mc" && (
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

          {current.type === "text" && (
            <div style={styles.textRow}>
              <input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitText()}
                placeholder="Skriv hovedstaden…"
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
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} className="rt-btn" onClick={startNewGame}>
              <RotateCcw size={16} style={{ marginRight: 6 }} /> Nytt sett
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
  card: {
    border: "2px dashed rgba(237,237,224,0.3)",
    borderRadius: 10,
    padding: "20px 16px",
    textAlign: "center",
  },
  question: {
    color: "#EDEDE0",
    fontSize: "clamp(16px, 4vw, 19px)",
    fontWeight: 600,
    fontFamily: "'IBM Plex Sans', sans-serif",
    marginBottom: 16,
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
};
