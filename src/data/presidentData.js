// Data for Presidentjakt. Alle svar er én navngitt president, slik at
// spørsmålene har ett utvetydig fasitsvar.
//
// Bevisste utelatelser:
// - 10- og 100-dollarsedlene (Hamilton og Franklin) er ikke med, siden de
//   avbilder personer som aldri var president — de ville brutt formatet.
// - "Eldste president" er utelatt: rekorden har skiftet i nyere tid, og et
//   svar som endrer seg er ikke en god quizfakta.
// - Grover Cleveland var lenge den eneste med to perioder som ikke fulgte
//   etter hverandre. Etter 2025 gjelder det også Donald Trump, så spørsmålet
//   er formulert som "den første" for å holde svaret entydig.
// - Partitilhørighet er utelatt: partienes politiske innhold har skiftet
//   kraftig gjennom historien, så det egner seg dårlig som fasit.

// Godkjente skrivemåter i tekstmodus (vanskelig). Etternavn alene godtas
// bare der det er utvetydig — "Roosevelt", "Johnson", "Bush" og "Adams"
// peker på flere presidenter og krever derfor fornavn.
export const ALIASES = {
  "George Washington": ["washington"],
  "John Adams": [],
  "Thomas Jefferson": ["jefferson"],
  "Andrew Jackson": ["jackson"],
  "William Henry Harrison": ["harrison", "william harrison"],
  "Abraham Lincoln": ["lincoln"],
  "Andrew Johnson": [],
  "Ulysses S. Grant": ["grant", "ulysses grant"],
  "Grover Cleveland": ["cleveland"],
  "William McKinley": ["mckinley"],
  "Theodore Roosevelt": ["teddy roosevelt"],
  "William Howard Taft": ["taft", "william taft"],
  "Woodrow Wilson": ["wilson"],
  "Warren G. Harding": ["harding", "warren harding"],
  "Calvin Coolidge": ["coolidge"],
  "Herbert Hoover": ["hoover"],
  "Franklin D. Roosevelt": ["fdr", "franklin roosevelt"],
  "Harry S. Truman": ["truman", "harry truman"],
  "Dwight D. Eisenhower": ["eisenhower", "dwight eisenhower", "ike"],
  "John F. Kennedy": ["kennedy", "jfk", "john kennedy"],
  "Lyndon B. Johnson": ["lbj", "lyndon johnson"],
  "Richard Nixon": ["nixon"],
  "Gerald Ford": ["ford"],
  "Jimmy Carter": ["carter"],
  "Ronald Reagan": ["reagan"],
  "George H. W. Bush": ["bush sr", "george bush sr"],
  "Bill Clinton": ["clinton"],
  "George W. Bush": ["bush jr", "george bush jr"],
  "Barack Obama": ["obama"],
  "Donald Trump": ["trump"],
  "Joe Biden": ["biden"],
};

// "Hvem var president under …?"
export const EVENTS = [
  { event: "den amerikanske borgerkrigen", president: "Abraham Lincoln", common: true },
  { event: "børskrakket i 1929", president: "Herbert Hoover", common: true },
  { event: "angrepet på Pearl Harbor i 1941", president: "Franklin D. Roosevelt", common: true },
  { event: "atombombene over Hiroshima og Nagasaki i 1945", president: "Harry S. Truman", common: true },
  { event: "Cubakrisen i 1962", president: "John F. Kennedy", common: true },
  { event: "månelandingen i 1969", president: "Richard Nixon", common: true },
  { event: "Watergate-skandalen", president: "Richard Nixon", common: true },
  { event: "gisselkrisen i Iran i 1979", president: "Jimmy Carter", common: true },
  { event: "Berlinmurens fall i 1989", president: "George H. W. Bush", common: true },
  { event: "terrorangrepet 11. september 2001", president: "George W. Bush", common: true },
  { event: "starten på koronapandemien i 2020", president: "Donald Trump", common: true },
  { event: "innføringen av New Deal på 1930-tallet", president: "Franklin D. Roosevelt", common: true },
  { event: "Louisiana-kjøpet i 1803", president: "Thomas Jefferson", common: false },
  { event: "kjøpet av Alaska fra Russland i 1867", president: "Andrew Johnson", common: false },
  { event: "USAs inntreden i første verdenskrig i 1917", president: "Woodrow Wilson", common: false },
  { event: "åpningen av Panamakanalen i 1914", president: "Woodrow Wilson", common: false },
  { event: "byggingen av Berlinmuren i 1961", president: "John F. Kennedy", common: false },
  { event: "vedtaket av borgerrettighetsloven i 1964", president: "Lyndon B. Johnson", common: false },
  { event: "Saigons fall i 1975", president: "Gerald Ford", common: false },
  { event: "lanseringen av Marshallplanen i 1948", president: "Harry S. Truman", common: false },
  { event: "Sovjetunionens oppløsning i 1991", president: "George H. W. Bush", common: false },
  { event: "invasjonen av Irak i 2003", president: "George W. Bush", common: false },
  { event: "aksjonen der Osama bin Laden ble drept i 2011", president: "Barack Obama", common: false },
  { event: "vedtaket av helsereformen Obamacare i 2010", president: "Barack Obama", common: false },
];

// "Hvem etterfulgte X som president?"
export const SUCCESSIONS = [
  { president: "George Washington", successor: "John Adams", common: false },
  { president: "John Adams", successor: "Thomas Jefferson", common: false },
  { president: "Abraham Lincoln", successor: "Andrew Johnson", common: false },
  { president: "William McKinley", successor: "Theodore Roosevelt", common: false },
  { president: "Warren G. Harding", successor: "Calvin Coolidge", common: false },
  { president: "Calvin Coolidge", successor: "Herbert Hoover", common: false },
  { president: "Herbert Hoover", successor: "Franklin D. Roosevelt", common: true },
  { president: "Franklin D. Roosevelt", successor: "Harry S. Truman", common: true },
  { president: "Harry S. Truman", successor: "Dwight D. Eisenhower", common: false },
  { president: "Dwight D. Eisenhower", successor: "John F. Kennedy", common: true },
  { president: "John F. Kennedy", successor: "Lyndon B. Johnson", common: true },
  { president: "Lyndon B. Johnson", successor: "Richard Nixon", common: false },
  { president: "Richard Nixon", successor: "Gerald Ford", common: true },
  { president: "Gerald Ford", successor: "Jimmy Carter", common: true },
  { president: "Jimmy Carter", successor: "Ronald Reagan", common: true },
  { president: "Ronald Reagan", successor: "George H. W. Bush", common: true },
  { president: "George H. W. Bush", successor: "Bill Clinton", common: true },
  { president: "Bill Clinton", successor: "George W. Bush", common: true },
  { president: "George W. Bush", successor: "Barack Obama", common: true },
  { president: "Barack Obama", successor: "Donald Trump", common: true },
];

// "Hvilken president er avbildet på …?"
export const MONEY = [
  { item: "1-dollarseddelen", president: "George Washington", common: true },
  { item: "5-dollarseddelen", president: "Abraham Lincoln", common: true },
  { item: "20-dollarseddelen", president: "Andrew Jackson", common: true },
  { item: "2-dollarseddelen", president: "Thomas Jefferson", common: false },
  { item: "50-dollarseddelen", president: "Ulysses S. Grant", common: true },
  { item: "25-centmynten (quarter)", president: "George Washington", common: true },
  { item: "1-centmynten (penny)", president: "Abraham Lincoln", common: true },
  { item: "5-centmynten (nickel)", president: "Thomas Jefferson", common: true },
  { item: "10-centmynten (dime)", president: "Franklin D. Roosevelt", common: false },
  { item: "50-centmynten (half dollar)", president: "John F. Kennedy", common: false },
];

// Beskrivelsen er ledetråden, presidenten er svaret.
export const FACTS = [
  { clue: "USAs første president", president: "George Washington", common: true },
  { clue: "Den første afroamerikanske presidenten", president: "Barack Obama", common: true },
  { clue: "Den eneste presidenten som har gått av midt i perioden", president: "Richard Nixon", common: true },
  { clue: "Presidenten som ble skutt i Ford's Theatre i 1865", president: "Abraham Lincoln", common: true },
  { clue: "Presidenten som ble drept i Dallas i 1963", president: "John F. Kennedy", common: true },
  { clue: "Presidenten som var skuespiller før han gikk inn i politikken", president: "Ronald Reagan", common: true },
  { clue: "Den eneste presidenten som har sittet mer enn to perioder", president: "Franklin D. Roosevelt", common: true },
  { clue: "Den yngste som er blitt valgt til president", president: "John F. Kennedy", common: true },
  { clue: "Den eneste presidenten som er blitt stilt for riksrett to ganger", president: "Donald Trump", common: true },
  { clue: "Presidenten som holdt Gettysburg-talen", president: "Abraham Lincoln", common: false },
  { clue: "Den eneste presidenten som verken var valgt til president eller visepresident", president: "Gerald Ford", common: false },
  { clue: "Presidenten som var øverstkommanderende for de allierte styrkene i Vest-Europa under andre verdenskrig", president: "Dwight D. Eisenhower", common: false },
  { clue: "Presidenten som satt kortest tid i embetet — bare 31 dager", president: "William Henry Harrison", common: false },
  { clue: "Presidenten som var med på å skrive uavhengighetserklæringen", president: "Thomas Jefferson", common: false },
  { clue: "Den første presidenten som flyttet inn i Det hvite hus", president: "John Adams", common: false },
  { clue: "Den første presidenten med to perioder som ikke fulgte etter hverandre", president: "Grover Cleveland", common: false },
  { clue: "Presidenten som teddybjørnen er oppkalt etter", president: "Theodore Roosevelt", common: false },
  { clue: "Den eneste som har vært både president og høyesterettsjustitiarius", president: "William Howard Taft", common: false },
  { clue: "Presidenten som fikk Nobels fredspris i 2009", president: "Barack Obama", common: false },
  { clue: "Presidenten som fikk Nobels fredspris i 2002, mange år etter at han gikk av", president: "Jimmy Carter", common: false },
  { clue: "Presidenten som ble drept ved et attentat i 1901", president: "William McKinley", common: false },
  { clue: "Presidenten som døde i embetet i april 1945", president: "Franklin D. Roosevelt", common: false },
];
