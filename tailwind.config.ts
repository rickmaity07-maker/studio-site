import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#07080B",
        surface: "#141821",
        surface2: "#1B202B",
        line: "#262B38",
        text: "#ECEEF3",
        muted: "#8991A3",
        live: "#4CE8B0",
        signal: "#FF7A45"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
        serif: ["var(--font-serif)"]
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)"
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.7)"
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" }
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" }
        },
        // Magic UI animated-shiny-text: the highlight sweeps across, then rests.
        "shiny-text": {
          "0%, 90%, 100%": { backgroundPosition: "calc(-100% - var(--shiny-width)) 0" },
          "30%, 60%": { backgroundPosition: "calc(100% + var(--shiny-width)) 0" }
        }
      },
      animation: {
        blink: "blink 1.6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        "shiny-text": "shiny-text 8s infinite"
      }
    }
  },
  // animate-in / fade-in classes used by shadcn-style components.
  plugins: [animate]
};

export default config;
