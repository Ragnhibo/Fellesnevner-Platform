// Cryptic clues for Kryptojakt, in the style of Minute Cryptic: each clue
// combines a plain-language definition with wordplay pointing to the same
// answer. Every entry here has been mechanically verified (see the repo's
// build notes) — anagram fodder is checked to be an exact letter-for-letter
// rearrangement of the answer, and hidden-word clues are checked to
// actually contain the answer as a contiguous run of letters once spaces
// and punctuation are stripped. This matters more than usual for cryptic
// clues, since an unverified "anagram" or "hidden word" is just wrong,
// not merely imprecise.

// type: "anagram" — the clue names a real Norwegian word (the "fodder")
// whose letters rearrange exactly into the answer, plus a plain
// definition of the answer.
export const ANAGRAM_CLUES = [
  { answer: "PALME", fodder: "LAMPE", definition: "Tre ved stranden" },
  { answer: "LANDE", fodder: "DALEN", definition: "Sette flyet ned" },
  { answer: "SEDAN", fodder: "DANSE", definition: "Bilkarosseri-type" },
  { answer: "NEDRE", fodder: "ENDRE", definition: "Underst, motsatt av øvre" },
  { answer: "DRIVE", fodder: "VERDI", definition: "Holde noe i gang, styre" },
  { answer: "TEGNE", fodder: "EGNET", definition: "Lage et bilde med blyant" },
  { answer: "EKORN", fodder: "KRONE", definition: "Gnager med luftig hale" },
  { answer: "ENGEL", fodder: "ELGEN", definition: "Himmelsk vesen med vinger" },
  { answer: "LENKE", fodder: "ENKEL", definition: "Binder sammen ledd i en kjede" },
  { answer: "NEKTE", fodder: "TENKE", definition: "Si nei til noe" },
  { answer: "ENORM", fodder: "MOREN", definition: "Kjempestor" },
  { answer: "RENTE", fodder: "TRENE", definition: "Det banken betaler deg for sparing" },
  { answer: "FIKSE", fodder: "FISKE", definition: "Reparere noe som er ødelagt" },
  { answer: "FLYTE", fodder: "FLYET", definition: "Holde seg oppe i vann" },
  { answer: "NAKKE", fodder: "KAKEN", definition: "Bak på halsen" },
  { answer: "MASKE", fodder: "SMAKE", definition: "Kan dekke ansiktet, eller et hull i strikketøy" },
  { answer: "STREK", fodder: "STERK", definition: "En rett linje på papiret" },
  { answer: "VASKE", fodder: "SVAKE", definition: "Gjøre rent med vann og såpe" },
  { answer: "RAMLE", fodder: "MALER", definition: "Falle brått over ende" },
  { answer: "LASTE", fodder: "SALTE", definition: "Fylle opp et kjøretøy med varer" },
  { answer: "LEIER", fodder: "LEIRE", definition: "Betaler for å bruke noe midlertidig" },
  { answer: "NISTE", fodder: "STEIN", definition: "Medbrakt mat i matboks" },
  { answer: "PRATE", fodder: "TAPER", definition: "Snakke løst og ledig" },
  { answer: "STORK", fodder: "TORSK", definition: "Fugl som (ifølge myten) bringer babyer" },
];

// type: "hidden" — the answer is concealed as a run of consecutive
// letters inside `sentence`, either spanning two adjacent words or
// sitting inside one longer word, once spaces/punctuation are removed.
export const HIDDEN_CLUES = [
  { answer: "ROSE", sentence: "Ro sekken opp i båten før det regner", definition: "Blomst med torner" },
  { answer: "NATT", sentence: "Kan natta bli kaldere enn i går?", definition: "Tiden mellom kveld og morgen" },
  { answer: "ISBRE", sentence: "Turister reiser til Norge for is, breer og fjorder", definition: "Stor ismasse i fjellet" },
  { answer: "ELEV", sentence: "Vi venter på sjokoladeleveringen fra fabrikken", definition: "Person som går på skole" },
  { answer: "OLJE", sentence: "Vi lette etter et symbol; jenter fra klassen hjalp til", definition: "Svart gull som pumpes fra Nordsjøen" },
  { answer: "HAGEN", sentence: "Vi bor i Kringsjåhagen, et koselig strøk", definition: "Stedet med blomster og grønnsaker rundt huset" },
  { answer: "AVIS", sentence: "Hun spiste litt av iskremen før frokost", definition: "Papir med nyheter man leser hver dag" },
  { answer: "STOL", sentence: "Han sto lenge og ventet på bussen", definition: "Møbel man sitter på" },
  { answer: "LEIE", sentence: "Vi betaler for hybel, eie er for dyrt", definition: "Betale for å bruke noe midlertidig" },
  { answer: "SEIL", sentence: "Vindkastene løsna seilduken fra masten", definition: "Stoffet som fanger vinden på en båt" },
  { answer: "VINDU", sentence: "Vi malte stuen lilla, vindussmyget ble hvitt", definition: "Åpningen i veggen man ser ut av" },
  { answer: "REKE", sentence: "Den store keiseren likte skalldyr til middag", definition: "Liten rosa skalldyr man skreller" },
  { answer: "ELDRE", sentence: "Etter regnet trengte tunnel drenering umiddelbart", definition: "Har levd lenger, motsatt av yngre" },
  { answer: "SKOLE", sentence: "Husk oleanderen når du vanner blomstene i sommer", definition: "Stedet barn lærer å lese og skrive" },
  { answer: "SOLA", sentence: "Vi møtte Nils Olavsen på kaia i går", definition: "Stjernen i sentrum av solsystemet vårt" },
  { answer: "KATT", sentence: "Om kvelden sov katta trygt i kurven sin", definition: "Kjæledyr som mjauer" },
  { answer: "GATE", sentence: "Han sang atelierets lovsang høyt i går", definition: "Vei mellom husrekker i en by" },
  { answer: "HUND", sentence: "Vi kjøpte hundre kroner med godteri på butikken", definition: "Kjæledyr som bjeffer" },
];
