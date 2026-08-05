// Events for Årstallsjakt. Deliberately limited to dates that are
// settled historical fact, not currently-contested or recent political
// events. A few notes on specific choices:
// - "Norges sørligste punkt" territory aside, historical dates below are
//   the standard, uncontroversial ones cited in Norwegian schools.
// - The 1994 EU referendum specified as "siste" (most recent) since
//   Norway also held one in 1972 — both resulted in "no".
// - Full women's suffrage in Norway is dated 1913 (universal); limited
//   suffrage from 1907 is the other commonly-cited but earlier milestone.
export const EVENTS = [
  { event: "Berlinmurens fall", year: 1989, common: true },
  { event: "Månelandingen (Apollo 11)", year: 1969, common: true },
  { event: "Den franske revolusjon starter", year: 1789, common: true },
  { event: "Andre verdenskrig starter", year: 1939, common: true },
  { event: "Andre verdenskrig slutter", year: 1945, common: true },
  { event: "Titanic synker", year: 1912, common: true },
  { event: "FN blir grunnlagt", year: 1945, common: false },
  { event: "Første verdenskrig starter", year: 1914, common: true },
  { event: "Første verdenskrig slutter", year: 1918, common: false },
  { event: "Columbus når Amerika", year: 1492, common: true },
  { event: "Den amerikanske uavhengighetserklæringen", year: 1776, common: false },
  { event: "Sovjetunionen oppløses", year: 1991, common: true },
  { event: "Den første iPhone lanseres", year: 2007, common: true },
  { event: "Wright-brødrenes første motorflytur", year: 1903, common: false },
  { event: "Napoleon beseires ved Waterloo", year: 1815, common: false },
  { event: "Norge får sin grunnlov på Eidsvoll", year: 1814, common: true },
  { event: "Unionsoppløsningen med Sverige", year: 1905, common: true },
  { event: "Tyskland invaderer Norge", year: 1940, common: true },
  { event: "Norge frigjøres fra tysk okkupasjon", year: 1945, common: true },
  { event: "Norge sier nei til EU (siste folkeavstemning)", year: 1994, common: false },
  { event: "Oljefunnet på Ekofisk", year: 1969, common: false },
  { event: "Kvinner får allmenn stemmerett i Norge", year: 1913, common: false },
  { event: "Vinter-OL på Lillehammer", year: 1994, common: true },
  { event: "Olav den hellige dør ved Stiklestad", year: 1030, common: false },
  { event: "Svartedauden når Norge", year: 1349, common: false },
  { event: "Kalmarunionen inngås", year: 1397, common: false },
  { event: "Roald Amundsen når Sydpolen", year: 1911, common: true },
  { event: "Penicillin oppdages", year: 1928, common: false },
  { event: "DNA-strukturen oppdages", year: 1953, common: false },
  { event: "Wikipedia lanseres", year: 2001, common: true },
  { event: "Facebook lanseres", year: 2004, common: true },
];
