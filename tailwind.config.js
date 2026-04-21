/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A14A",
          light: "#E8C97A",
          dark: "#A07830",
        },
        zose: {
          dark: "#0A0A0A",
          dark2: "#141414",
          dark3: "#1E1E1E",
          "off-white": "#F5F0E8",
          muted: "#888880",
        },
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"],
      },
      animation: {
        "fade-up": "fadeUp .8s cubic-bezier(.22,.61,.36,1) both",
        "fade-in": "fadeIn .5s ease both",
        "modal-in": "modalIn .25s cubic-bezier(.22,.61,.36,1) both",
        marquee: "marquee 20s linear infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(28px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        modalIn: {
          from: { opacity: "0", transform: "translateY(20px) scale(0.97)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
