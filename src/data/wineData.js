// Data for Vinjakt. Deliberately conservative: regions are unambiguous
// (no cross-border or contested appellations). GRAPES below is limited to
// varieties with one clearly dominant "signature" country today. The more
// internationally-planted varieties (Cabernet Sauvignon, Chardonnay,
// Merlot, etc.) are grown at serious quality in several countries, so a
// single "correct" country wouldn't be a fact — those are quizzed via
// GRAPE_TRAITS instead, on well-established tasting characteristics
// (color, body, tannin, classic aroma notes) rather than geography.

export const REGIONS = [
  { name: "Champagne", country: "Frankrike", common: true },
  { name: "Bordeaux", country: "Frankrike", common: true },
  { name: "Bourgogne", country: "Frankrike", common: true },
  { name: "Rhône-dalen", country: "Frankrike", common: false },
  { name: "Loire-dalen", country: "Frankrike", common: false },
  { name: "Alsace", country: "Frankrike", common: false },
  { name: "Chianti", country: "Italia", common: true },
  { name: "Barolo", country: "Italia", common: true },
  { name: "Toscana", country: "Italia", common: true },
  { name: "Piemonte", country: "Italia", common: false },
  { name: "Veneto", country: "Italia", common: false },
  { name: "Rioja", country: "Spania", common: true },
  { name: "Ribera del Duero", country: "Spania", common: false },
  { name: "Priorat", country: "Spania", common: false },
  { name: "Douro-dalen", country: "Portugal", common: true },
  { name: "Napa Valley", country: "USA", common: true },
  { name: "Sonoma", country: "USA", common: false },
  { name: "Willamette Valley", country: "USA", common: false },
  { name: "Barossa Valley", country: "Australia", common: true },
  { name: "Marlborough", country: "New Zealand", common: true },
  { name: "Mendoza", country: "Argentina", common: true },
  { name: "Stellenbosch", country: "Sør-Afrika", common: false },
  { name: "Mosel", country: "Tyskland", common: true },
  { name: "Rheingau", country: "Tyskland", common: false },
  { name: "Santorini", country: "Hellas", common: false },
  { name: "Tokaj", country: "Ungarn", common: false },
];

export const GRAPES = [
  { name: "Malbec", country: "Argentina", common: true },
  { name: "Sangiovese", country: "Italia", common: true },
  { name: "Nebbiolo", country: "Italia", common: false },
  { name: "Tempranillo", country: "Spania", common: true },
  { name: "Pinotage", country: "Sør-Afrika", common: false },
  { name: "Zinfandel", country: "USA", common: true },
  { name: "Carmenère", country: "Chile", common: true },
  { name: "Grüner Veltliner", country: "Østerrike", common: false },
  { name: "Assyrtiko", country: "Hellas", common: false },
  { name: "Torrontés", country: "Argentina", common: false },
  { name: "Touriga Nacional", country: "Portugal", common: false },
  { name: "Furmint", country: "Ungarn", common: false },
  { name: "Verdejo", country: "Spania", common: false },
  { name: "Xinomavro", country: "Hellas", common: false },
  { name: "Aglianico", country: "Italia", common: false },
  { name: "Gamay", country: "Frankrike", common: false },
];

// International varieties are grown at serious quality in several
// countries, so "which country" doesn't have one fair answer for these —
// instead they're quizzed on well-established tasting/style
// characteristics (color, body, tannin, classic aroma notes), which is
// standard wine-course material rather than a contested fact.
export const GRAPE_TRAITS = [
  { grape: "Cabernet Sauvignon", clue: "Rødvinsdrue med høye tanniner, ofte med aromaer av solbær og sedertre", common: true },
  { grape: "Chardonnay", clue: "Hvitvinsdrue som kan lages både fatlagret og ståltanklagret, fra eple- til smør- og vaniljetoner", common: true },
  { grape: "Merlot", clue: "Rødvinsdrue som gjerne er mykere og rundere enn Cabernet Sauvignon, med aromaer av plomme og kirsebær", common: true },
  { grape: "Sauvignon Blanc", clue: "Hvitvinsdrue kjent for frisk syre og aromaer av stikkelsbær og nyklipt gress", common: true },
  { grape: "Pinot Noir", clue: "Lys, tynnskallet rødvinsdrue med lave tanniner og aromaer av jordbær og bringebær", common: true },
  { grape: "Syrah", clue: "Mørk, kraftig rødvinsdrue med aromaer av mørke bær, pepper og krydder", common: true },
  { grape: "Grenache", clue: "Rødvinsdrue med høyt alkoholnivå, ofte brukt i blandinger med krydret bærfrukt-smak", common: false },
  { grape: "Chenin Blanc", clue: "Hvitvinsdrue med høy syre som kan lages tørr, søt eller musserende", common: false },
  { grape: "Viognier", clue: "Aromatisk hvitvinsdrue kjent for duft av aprikos og fersken", common: false },
  { grape: "Muscat", clue: "Svært aromatisk drue kjent for sterk duft av drue og blomster, ofte i søte og musserende viner", common: false },
  { grape: "Gewürztraminer", clue: "Aromatisk hvitvinsdrue med tydelig duft av rosenblad og litchi", common: false },
];
// Definitional wine vocabulary — the definition is the clue, the term is
// the answer, in the same spirit as Kryptojakt's cryptic definitions.
export const TERMS = [
  { term: "Tanniner", definition: "Stoffer fra drueskall og fat som gir munnfølelse og lett beskhet", common: true },
  { term: "Terroir", definition: "Summen av jord, klima og beliggenhet som preger smaken til en vin", common: true },
  { term: "Dekantering", definition: "Å helle vin over i en karaffel før servering, ofte for å lufte den", common: true },
  { term: "Malolaktisk gjæring", definition: "Omdanning av den skarpe eplesyren til mykere melkesyre i vinen", common: false },
  { term: "Cuvée", definition: "En blanding av flere druesorter eller partier i én vin", common: false },
  { term: "Årgang", definition: "Året druene i en vin ble høstet", common: true },
  { term: "Champagnemetoden", definition: "Metoden der andregangsgjæringen skjer på flasken, brukt for ekte champagne", common: false },
  { term: "Edelråte", definition: "En sopp som konsentrerer sukkeret i druer, brukt til søte dessertviner", common: false },
  { term: "Appellasjon", definition: "Et geografisk avgrenset område med regler for hvordan vinen skal lages", common: true },
  { term: "Sommelier", definition: "En fagperson som er ekspert på vin og vinservering", common: true },
  { term: "Korksmak", definition: "En vinfeil som gir lukt av vått papp eller kjeller, forårsaket av soppen TCA", common: false },
  { term: "Magnum", definition: "En vinflaske som rommer 1,5 liter, dobbelt så mye som en standardflaske", common: true },
  { term: "Perlage", definition: "Boblene i en musserende vin og kvaliteten på dem", common: false },
  { term: "Vinifikasjon", definition: "Hele prosessen med å omdanne druer til ferdig vin", common: false },
  { term: "Fatlagring", definition: "Å lagre vin på trefat for å tilføre smak, farge og struktur", common: true },
];
