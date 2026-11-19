import React, { useId } from "react";

// 2Syria logo mark: a map pin with a "2" on a light-blue tile
export const LogoMark = ({ className = "" }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="2Syria logo">
      <defs>
        <linearGradient id={`lg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5CC0FF" />
          <stop offset="1" stopColor="#1A6FB8" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#lg${id})`} />
      <path
        d="M32 9c-9.4 0-17 7.4-17 16.6C15 38 32 55 32 55s17-17 17-29.4C49 16.4 41.4 9 32 9z"
        fill="#fff"
      />
      <path
        d="M25.6 21.6a6.6 6.6 0 0 1 12.9 1.9c0 2.4-1.3 4-3.6 6.2L26 37.6h12.6"
        fill="none"
        stroke="#1E86D8"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Brand = ({ className = "", light = false }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark className="h-8 w-8 drop-shadow-sm" />
    <span
      className={`text-lg font-extrabold tracking-tight ${
        light ? "text-white" : "text-ink-900 dark:text-white"
      }`}
      style={{ textTransform: "none" }}
    >
      2<span className="text-brand-500 dark:text-brand-300">Syria</span>
    </span>
  </div>
);

export default Brand;
