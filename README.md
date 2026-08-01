# Fellesnevner — lansering som nettside

## Struktur (flere spill på samme plattform)

Siden er nå bygget for å huse flere spill:

- `src/pages/Home.jsx` — forsiden med spillvalg
- `src/games/Ordspill.jsx` — selve ordspillet (det som tidligere var hele appen)
- `src/components/` — delt logo, annonsefelt og sideramme, brukt av alle sider
- `src/theme.js` — delte farger, fonter og stiler, slik at et nytt spill automatisk ser ut som resten av plattformen

**Slik legger du til spill nummer to senere:** lag en ny fil i `src/games/`, bygg spillet der (bruk gjerne `Ordspill.jsx` som mal for hvordan man bruker `PageShell`), legg til én ny `<Route>` i `src/App.jsx`, og ett nytt kort i `GAMES`-lista i `src/pages/Home.jsx`. Ingenting annet trenger å endres.

Denne mappen er en komplett, klar-til-lansering nettside. Under er alt du trenger å gjøre, i rekkefølge. Alt er gratis (Supabase og Vercel har gratis nivåer som er mer enn nok for dette).

Regn med 20–30 minutter totalt første gang.

---

## 1. Opprett en GitHub-konto og last opp koden

GitHub er stedet koden din bor, og Vercel henter siden derfra automatisk hver gang du gjør en endring.

1. Gå til [github.com](https://github.com) → **Sign up** → lag en konto (gratis).
2. Klikk **+** øverst til høyre → **New repository**.
3. Gi den navnet `fellesnevner` → **Public** eller **Private** (begge fungerer) → **Create repository**.
4. På neste side, bruk **"uploading an existing file"**-lenken og dra inn alle filene fra denne mappen (behold mappestrukturen — `src`-mappen må bli med).
5. Klikk **Commit changes**.

*(Hvis du heller vil bruke `git` fra terminalen: `git init`, `git add .`, `git commit -m "Første versjon"`, koble til GitHub-repoet og `git push` — men opplastings-knappen i nettleseren er like grei for en engangsjobb.)*

---

## 2. Opprett Supabase-prosjekt (databasen bak topplisten)

1. Gå til [supabase.com](https://supabase.com) → **Start your project** → logg inn med GitHub-kontoen din.
2. **New project** → gi det et navn (f.eks. `fellesnevner`) → velg et passord (lagre det et sted) → velg region **Europe (Frankfurt eller Stockholm)** for lavest ventetid → **Create new project**. Ta 1–2 minutter å opprette.
3. Når prosjektet er klart: gå til **SQL Editor** (i menyen til venstre) → **New query**.
4. Åpne filen `supabase-schema.sql` fra denne mappen, kopier hele innholdet inn i SQL-editoren, og klikk **Run**.
5. Gå til **Project Settings → API**. Her finner du to ting du trenger om litt:
   - **Project URL**
   - **anon public key**

---

## 3. Opprett Vercel-konto og koble til nettsiden

1. Gå til [vercel.com](https://vercel.com) → **Sign up** → velg **Continue with GitHub**.
2. Klikk **Add New… → Project**.
3. Velg `fellesnevner`-repoet du lastet opp i steg 1 → **Import**.
4. Før du trykker Deploy: åpne **Environment Variables** og legg til de to verdiene fra Supabase (steg 2.5):
   - `VITE_SUPABASE_URL` → lim inn Project URL
   - `VITE_SUPABASE_ANON_KEY` → lim inn anon public key
5. Klikk **Deploy**. Etter 1–2 minutter får du en lenke som `fellesnevner-xyz.vercel.app` — siden er nå live.

---

## 4. Koble til eget domene

1. Registrer et domene hos f.eks. [domeneshop.no](https://domeneshop.no) eller [domene.no](https://domene.no) — sjekk om `fellesnevner.no`, `fellesnevnerspill.no` eller `fellesnevner.app` er ledig.
2. I Vercel: gå inn på prosjektet → **Settings → Domains** → skriv inn domenet ditt → **Add**.
3. Vercel viser deg 1–2 DNS-innstillinger (en CNAME eller A-post) du må legge inn hos domeneregistraren din. De fleste registrarer har et "DNS-innstillinger"-panel hvor dette limes inn.
4. Det tar fra noen minutter til noen timer før domenet er aktivt (DNS må spre seg).

---

## Når koden skal oppdateres senere

Bare last opp nye/endrede filer til GitHub-repoet (samme fremgangsmåte som steg 1.4) — Vercel bygger og publiserer automatisk på nytt hver gang.

## Om topplisten

Den er åpen og krever ikke innlogging, så den passer fint for uformell bruk blant kollegaer. Siden det ikke er noen serverside-sjekk av at tiden faktisk stemmer, er den ikke juksesikker mot noen som virkelig prøver — grei å vite, ikke noe å bekymre seg over til vanlig bruk.
