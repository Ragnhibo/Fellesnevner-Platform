import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { GLOBAL_CSS } from "./theme";
import Home from "./pages/Home";
import Ordspill from "./games/Ordspill";

export default function App() {
  return (
    <BrowserRouter>
      <style>{GLOBAL_CSS}</style>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ordspill" element={<Ordspill />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}
