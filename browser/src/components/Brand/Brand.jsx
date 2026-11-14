import React from "react";

// The new Syrian flag: green / white / black with three red stars
export const SyrianFlag = ({ className = "" }) => (
  <svg
    viewBox="0 0 900 600"
    className={className}
    role="img"
    aria-label="Syrian flag"
  >
    <rect width="900" height="200" fill="#007A3D" />
    <rect y="200" width="900" height="200" fill="#FFFFFF" />
    <rect y="400" width="900" height="200" fill="#000000" />
    {[240, 450, 660].map((x) => (
      <polygon
        key={x}
        fill="#CE1126"
        transform={`translate(${x - 240} 0)`}
        points="240.00,242.00 253.02,282.08 295.16,282.08 261.07,306.85 274.09,346.92 240.00,322.16 205.91,346.92 218.93,306.85 184.84,282.08 226.98,282.08"
      />
    ))}
  </svg>
);

const Brand = ({ className = "", light = false }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <SyrianFlag className="h-6 w-9 rounded-[5px] shadow-sm ring-1 ring-black/10" />
    <span
      className={`text-lg font-extrabold tracking-tight ${
        light ? "text-white" : "text-ink-900 dark:text-white"
      }`}
      style={{ textTransform: "none" }}
    >
      2Syria
    </span>
  </div>
);

export default Brand;
