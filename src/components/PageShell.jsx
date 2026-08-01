import React from "react";
import { shared } from "../theme";
import AdSlot, { ADS_CONFIGURED } from "./AdSlot";

export default function PageShell({ children }) {
  return (
    <div style={shared.page}>
      {ADS_CONFIGURED && (
        <div className="rt-sidebar" style={shared.sidebar}>
          <AdSlot />
        </div>
      )}
      <div style={shared.container}>
        <div style={shared.woodRule} />
        {children}
      </div>
    </div>
  );
}
