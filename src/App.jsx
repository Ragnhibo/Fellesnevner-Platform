import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GLOBAL_CSS } from "./theme";
import Home from "./pages/Home";

const Topplister = lazy(() => import("./pages/Topplister"));
const Ordspill = lazy(() => import("./games/Ordspill"));
const Ordjakt = lazy(() => import("./games/Ordjakt"));
const Kodejakt = lazy(() => import("./games/Kodejakt"));
const Hovedstadsjakt = lazy(() => import("./games/Hovedstadsjakt"));
const Bokstavjakt = lazy(() => import("./games/Bokstavjakt"));
const Delstatsjakt = lazy(() => import("./games/Delstatsjakt"));
const Regnejakt = lazy(() => import("./games/Regnejakt"));
const Flaggjakt = lazy(() => import("./games/Flaggjakt"));
const Sekvensjakt = lazy(() => import("./games/Sekvensjakt"));
const Kryptojakt = lazy(() => import("./games/Kryptojakt"));
const Vinjakt = lazy(() => import("./games/Vinjakt"));
const Norgesjakt = lazy(() => import("./games/Norgesjakt"));
const Arstallsjakt = lazy(() => import("./games/Arstallsjakt"));
const Gjettejakt = lazy(() => import("./games/Gjettejakt"));
const BarnHome = lazy(() => import("./pages/BarnHome"));
const RegnejaktBarn = lazy(() => import("./games/RegnejaktBarn"));
const FormjaktBarn = lazy(() => import("./games/FormjaktBarn"));
const KlokkejaktBarn = lazy(() => import("./games/KlokkejaktBarn"));
const StaveJaktBarn = lazy(() => import("./games/StaveJaktBarn"));
const LeseJaktBarn = lazy(() => import("./games/LeseJaktBarn"));

function LoadingFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8FA089",
        fontFamily: "'IBM Plex Sans', sans-serif",
        fontSize: 13,
      }}
    >
      Laster…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{GLOBAL_CSS}</style>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/topplister" element={<Topplister />} />
          <Route path="/ordspill" element={<Ordspill />} />
          <Route path="/ordjakt" element={<Ordjakt />} />
          <Route path="/kodejakt" element={<Kodejakt />} />
          <Route path="/hovedstadsjakt" element={<Hovedstadsjakt />} />
          <Route path="/bokstavjakt" element={<Bokstavjakt />} />
          <Route path="/delstatsjakt" element={<Delstatsjakt />} />
          <Route path="/regnejakt" element={<Regnejakt />} />
          <Route path="/flaggjakt" element={<Flaggjakt />} />
          <Route path="/sekvensjakt" element={<Sekvensjakt />} />
          <Route path="/kryptojakt" element={<Kryptojakt />} />
          <Route path="/vinjakt" element={<Vinjakt />} />
          <Route path="/norgesjakt" element={<Norgesjakt />} />
          <Route path="/arstallsjakt" element={<Arstallsjakt />} />
          <Route path="/gjettejakt" element={<Gjettejakt />} />
          <Route path="/barn" element={<BarnHome />} />
          <Route path="/barn/regning" element={<RegnejaktBarn />} />
          <Route path="/barn/former" element={<FormjaktBarn />} />
          <Route path="/barn/klokka" element={<KlokkejaktBarn />} />
          <Route path="/barn/staving" element={<StaveJaktBarn />} />
          <Route path="/barn/lesing" element={<LeseJaktBarn />} />
        </Routes>
      </Suspense>
      <Analytics />
    </BrowserRouter>
  );
}
