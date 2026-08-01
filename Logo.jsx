import React from "react";

// The platform mark: four colored dots resolving across a chalk line into
// one dot — "fellesnevner" (common denominator), visualized. Shared by the
// homepage and every game so the brand stays consistent across the site.
export default function Logo({ size = 64 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", margin: "0 auto 6px" }}>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#EDEDE0" strokeWidth="3" strokeDasharray="5 4" opacity="0.85" />
      {[
        { x: 28, color: "#E8C15A", delay: 0 },
        { x: 42.5, color: "#8FC98A", delay: 80 },
        { x: 57.5, color: "#8FB8D9", delay: 160 },
        { x: 72, color: "#D98FA0", delay: 240 },
      ].map((d, i) => (
        <circle key={i} className="rt-logo-dot" cx={d.x} cy="34" r="5.5" fill={d.color} style={{ animationDelay: `${d.delay}ms` }} />
      ))}
      <path
        className="rt-chalk-line"
        d="M20 52 Q 35 49, 50 52 T 80 52"
        fill="none"
        stroke="#EDEDE0"
        strokeWidth="4.5"
        strokeLinecap="round"
        pathLength="1"
        style={{ animationDelay: "260ms" }}
      />
      <circle className="rt-logo-dot" cx="50" cy="70" r="7" fill="#E8C15A" stroke="#EDEDE0" strokeWidth="1.5" style={{ animationDelay: "520ms" }} />
    </svg>
  );
}
