// Data for Norgesjakt. Counties reflect the layout in effect since
// 1. januar 2024, when Viken, Vestfold og Telemark, and Troms og
// Finnmark were split back into their earlier counties (Norway has had
// four different county counts since 2018: 19 → 18 → 11 → 15). This is
// the current, correct list as of 2026 — worth re-checking if another
// reform is ever announced.
export const FYLKER = [
  { fylke: "Oslo", senter: "Oslo", common: true },
  { fylke: "Rogaland", senter: "Stavanger", common: true },
  { fylke: "Møre og Romsdal", senter: "Molde", common: false },
  { fylke: "Nordland", senter: "Bodø", common: true },
  { fylke: "Østfold", senter: "Sarpsborg", common: false },
  { fylke: "Akershus", senter: "Oslo", common: false },
  { fylke: "Buskerud", senter: "Drammen", common: false },
  { fylke: "Innlandet", senter: "Hamar", common: false },
  { fylke: "Vestfold", senter: "Tønsberg", common: false },
  { fylke: "Telemark", senter: "Skien", common: false },
  { fylke: "Agder", senter: "Kristiansand", common: true },
  { fylke: "Vestland", senter: "Bergen", common: true },
  { fylke: "Trøndelag", senter: "Steinkjer", common: true },
  { fylke: "Troms", senter: "Tromsø", common: true },
  { fylke: "Finnmark", senter: "Vadsø", common: false },
];

// Well-established Norwegian geography/history facts — kept to figures
// that aren't seriously contested (deliberately using "sørligste punkt
// på fastlandet" (Lindesnes) rather than the popular-but-technically-
// wrong Nordkapp-is-the-northernmost-point claim, for instance).
export const FACTS = [
  { question: "Norges høyeste fjell", answer: "Galdhøpiggen", common: true },
  { question: "Norges lengste elv", answer: "Glomma", common: true },
  { question: "Norges største innsjø", answer: "Mjøsa", common: true },
  { question: "Norges dypeste innsjø", answer: "Hornindalsvatnet", common: false },
  { question: "Norges sørligste punkt på fastlandet", answer: "Lindesnes", common: true },
  { question: "Norges lengste og dypeste fjord", answer: "Sognefjorden", common: true },
  { question: "Norges nest største by", answer: "Bergen", common: true },
  { question: "Norges lengste veitunnel", answer: "Lærdalstunnelen", common: false },
  { question: "Trolltunga ligger i hvilken kommune", answer: "Odda", common: false },
  { question: "Norges største øy (utenom Svalbard)", answer: "Hinnøya", common: false },
];
