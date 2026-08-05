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
//
// Each fact has a `pool` tag (fjell, elv, innsjø, etc.) — wrong-answer
// options for multiple choice are drawn from DECOY_POOL[pool], so a
// question about the highest mountain only ever offers other real
// mountains as wrong answers, not an unrelated lake or city name.
export const FACTS = [
  { question: "Norges høyeste fjell", answer: "Galdhøpiggen", pool: "fjell", common: true },
  { question: "Norges lengste elv", answer: "Glomma", pool: "elv", common: true },
  { question: "Norges største innsjø", answer: "Mjøsa", pool: "innsjo", common: true },
  { question: "Norges dypeste innsjø", answer: "Hornindalsvatnet", pool: "innsjo", common: false },
  { question: "Norges sørligste punkt på fastlandet", answer: "Lindesnes", pool: "punkt", common: true },
  { question: "Norges lengste og dypeste fjord", answer: "Sognefjorden", pool: "fjord", common: true },
  { question: "Norges nest største by", answer: "Bergen", pool: "by", common: true },
  { question: "Norges lengste veitunnel", answer: "Lærdalstunnelen", pool: "tunnel", common: false },
  { question: "Trolltunga ligger i hvilken kommune", answer: "Odda", pool: "kommune", common: false },
  { question: "Norges største øy (utenom Svalbard)", answer: "Hinnøya", pool: "oy", common: false },
];

// Real Norwegian names for each pool, used purely as multiple-choice
// decoys — plausible, same-category, but wrong for that question.
export const DECOY_POOL = {
  fjell: ["Glittertind", "Snøhetta", "Store Skagastølstind"],
  elv: ["Gaula", "Numedalslågen", "Tana"],
  innsjo: ["Femunden", "Røssvatnet", "Randsfjorden"],
  punkt: ["Nordkapp", "Stad", "Kinnarodden"],
  fjord: ["Hardangerfjorden", "Geirangerfjorden", "Trondheimsfjorden"],
  by: ["Trondheim", "Stavanger", "Kristiansand"],
  tunnel: ["Gudvangatunnelen", "Ryfylketunnelen", "Fannefjordtunnelen"],
  kommune: ["Voss", "Ulvik", "Eidfjord"],
  oy: ["Senja", "Langøya", "Magerøya"],
};
