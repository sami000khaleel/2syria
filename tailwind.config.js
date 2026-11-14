/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        // Light blue brand colour
        brand: {
          50: "#EEF8FF",
          100: "#D9EFFE",
          200: "#BCE3FD",
          300: "#8ED1FB",
          400: "#59B8F7",
          500: "#2496E6",
          600: "#1A7FCC",
          700: "#1A67A8",
          800: "#1B578A",
          900: "#1C4972",
        },
        // Red of the three stars
        star: {
          400: "#E2394B",
          500: "#CE1126",
          600: "#A90E1F",
        },
        // Cool light surfaces
        sand: {
          50: "#F6F9FC",
          100: "#EEF3F8",
          200: "#DEE6EF",
          300: "#C7D3E0",
        },
        // Blue-grey neutrals for text and dark surfaces
        ink: {
          50: "#EEF2F7",
          100: "#DDE4EC",
          200: "#BFCAD6",
          300: "#9CAABA",
          400: "#7D8B9C",
          500: "#5D6B7C",
          600: "#3B4757",
          700: "#273241",
          800: "#1C2531",
          850: "#161E28",
          900: "#111821",
          950: "#0A0F16",
        },
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(-32px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-up": {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "drop-in": {
          "0%": { transform: "translateY(-18px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // uses the standalone `scale` property so it never fights Tailwind's translate/transform classes
        "scale-in": {
          "0%": { scale: "0.95", opacity: "0" },
          "100%": { scale: "1", opacity: "1" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(40px, -30px) scale(1.15)" },
        },
        shake: {
          "0%, 100%": { rotate: "0deg" },
          "20%, 60%": { rotate: "-12deg" },
          "40%, 80%": { rotate: "12deg" },
        },
      },
      animation: {
        "slide-in": "slide-in 450ms cubic-bezier(.16,1,.3,1)",
        "fade-up": "fade-up 500ms cubic-bezier(.16,1,.3,1) backwards",
        "drop-in": "drop-in 600ms cubic-bezier(.16,1,.3,1) backwards",
        "scale-in": "scale-in 260ms cubic-bezier(.16,1,.3,1)",
        "sheet-up": "sheet-up 420ms cubic-bezier(.16,1,.3,1)",
        float: "float 6s ease-in-out infinite",
        drift: "drift 14s ease-in-out infinite alternate",
        shake: "shake 600ms ease-in-out 250ms",
      },
    },
  },
  plugins: [],
};
