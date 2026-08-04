import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GLOBAL_CSS } from "./theme";
import Home from "./pages/Home";
import Topplister from "./pages/Topplister";
import Ordspill from "./games/Ordspill";
import Ordjakt from "./games/Ordjakt";
import Kodejakt from "./games/Kodejakt";
import Hovedstadsjakt from "./games/Hovedstadsjakt";
import Bokstavjakt from "./games/Bokstavjakt";
import Delstatsjakt from "./games/Delstatsjakt";
import Regnejakt from "./games/Regnejakt";
import Flaggjakt from "./games/Flaggjakt";
import Sekvensjakt from "./games/Sekvensjakt";
import Kryptojakt from "./games/Kryptojakt";
import Vinjakt from "./games/Vinjakt";

export default function App() {
  return (
    <BrowserRouter>
      <style>{GLOBAL_CSS}</style>
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
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
