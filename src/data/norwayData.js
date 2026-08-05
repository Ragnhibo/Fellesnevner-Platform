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
// wrong Nordkapp-is-the-northernmost-point claim, for instance — and
// including the correct northernmost point, Kinnarodden, as its own
// question precisely to correct that popular misconception).
//
// Each fact has a `pool` tag — wrong-answer options for multiple choice
// are drawn dynamically from CATEGORY_POOLS[pool] (excluding the correct
// answer itself), so a question about the highest mountain only ever
// offers other real mountains as wrong answers, never an unrelated lake
// or city name.
export const FACTS = [
  { question: "Norges høyeste fjell", answer: "Galdhøpiggen", pool: "fjell", common: true },
  { question: "Norges nest høyeste fjell", answer: "Glittertind", pool: "fjell", common: false },
  { question: "Norges lengste elv", answer: "Glomma", pool: "elv", common: true },
  { question: "Norges største innsjø", answer: "Mjøsa", pool: "innsjo", common: true },
  { question: "Norges dypeste innsjø", answer: "Hornindalsvatnet", pool: "innsjo", common: false },
  { question: "Norges sørligste punkt på fastlandet", answer: "Lindesnes", pool: "punkt", common: true },
  { question: "Norges nordligste punkt på fastlandet (ikke Nordkapp!)", answer: "Kinnarodden", pool: "punkt", common: false },
  { question: "Norges lengste og dypeste fjord", answer: "Sognefjorden", pool: "fjord", common: true },
  { question: "Fjorden kjent for Trollstigen, cruiseturisme og UNESCO-status", answer: "Geirangerfjorden", pool: "fjord", common: true },
  { question: "Norges nest største by", answer: "Bergen", pool: "by", common: true },
  { question: "Norges tredje største by", answer: "Trondheim", pool: "by", common: false },
  { question: "Norges eldste by", answer: "Tønsberg", pool: "by", common: false },
  { question: "Norges lengste veitunnel", answer: "Lærdalstunnelen", pool: "tunnel", common: false },
  { question: "Trolltunga ligger i hvilken kommune", answer: "Odda", pool: "kommune", common: false },
  { question: "Norges største øy (utenom Svalbard)", answer: "Hinnøya", pool: "oy", common: false },
  { question: "Norges høyeste foss", answer: "Vinnufossen", pool: "foss", common: false },
  { question: "Norges lengste bru", answer: "Hålogalandsbrua", pool: "bru", common: false },
  { question: "Norges mest besøkte nasjonalpark", answer: "Jotunheimen", pool: "park", common: true },
];

// Real Norwegian names per category, used both as the correct answers
// above and as the pool multiple-choice decoys are drawn from.
export const CATEGORY_POOLS = {
  fjell: ["Galdhøpiggen", "Glittertind", "Snøhetta", "Store Skagastølstind", "Skarstind"],
  elv: ["Glomma", "Gaula", "Numedalslågen", "Tana", "Otra"],
  innsjo: ["Mjøsa", "Hornindalsvatnet", "Femunden", "Røssvatnet", "Randsfjorden", "Tyrifjorden"],
  punkt: ["Lindesnes", "Kinnarodden", "Nordkapp", "Stad"],
  fjord: ["Sognefjorden", "Geirangerfjorden", "Hardangerfjorden", "Trondheimsfjorden", "Oslofjorden"],
  by: ["Bergen", "Trondheim", "Tønsberg", "Stavanger", "Kristiansand", "Tromsø", "Ålesund"],
  tunnel: ["Lærdalstunnelen", "Gudvangatunnelen", "Ryfylketunnelen", "Fannefjordtunnelen"],
  kommune: ["Odda", "Voss", "Ulvik", "Eidfjord"],
  oy: ["Hinnøya", "Senja", "Langøya", "Magerøya"],
  foss: ["Vinnufossen", "Mardalsfossen", "Vøringsfossen", "Langfossen"],
  bru: ["Hålogalandsbrua", "Nordhordlandsbrua", "Bergsøysundbrua", "Gjemnessundbrua"],
  park: ["Jotunheimen", "Rondane", "Hardangervidda", "Dovrefjell"],
};
