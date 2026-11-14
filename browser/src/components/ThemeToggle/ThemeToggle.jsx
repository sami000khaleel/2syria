import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Moon, Sun } from "lucide-react";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
  } catch (e) {}
  if (document.documentElement.classList.contains("dark")) return "dark";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        const next = isDark ? "light" : "dark";
        const apply = () => {
          document.documentElement.classList.toggle("dark", next === "dark");
          flushSync(() => setTheme(next));
        };
        const reduce =
          window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!document.startViewTransition || reduce) return apply();
        // grow the new theme out of the button in a circle
        const r = e.currentTarget.getBoundingClientRect();
        const x = r.left + r.width / 2;
        const y = r.top + r.height / 2;
        const radius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        );
        const transition = document.startViewTransition(apply);
        transition.ready
          .then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${radius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 600,
                easing: "cubic-bezier(.4,0,.2,1)",
                pseudoElement: "::view-transition-new(root)",
              }
            );
          })
          .catch(() => {});
      }}
      aria-label={isDark ? "switch to light mode" : "switch to dark mode"}
      title={isDark ? "light mode" : "dark mode"}
      className={`icon-btn overflow-hidden ${className || "relative"}`}
    >
      <Sun
        size={20}
        className={`absolute transition-all duration-500 ${
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
        }`}
      />
      <Moon
        size={20}
        className={`absolute transition-all duration-500 ${
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
