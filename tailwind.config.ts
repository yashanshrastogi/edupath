import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        bg: {
          primary: "#0a0a0f",
          secondary: "#111118",
          card: "#16161f",
        },
        accent: {
          violet: "#8b5cf6",
          purple: "#a855f7",
          indigo: "#6366f1",
          emerald: "#10b981",
          cyan: "#06b6d4",
          rose: "#f43f5e",
          amber: "#f59e0b",
        },
      },
      backgroundImage: {
        "gradient-main": "linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%)",
        "gradient-card": "linear-gradient(145deg, rgba(139,92,246,0.08) 0%, rgba(99,102,241,0.05) 100%)",
        "gradient-emerald": "linear-gradient(135deg, #10b981, #06b6d4)",
        "gradient-rose": "linear-gradient(135deg, #f43f5e, #f59e0b)",
      },
      boxShadow: {
        "glow-violet": "0 0 40px rgba(139, 92, 246, 0.3)",
        "glow-emerald": "0 0 40px rgba(16, 185, 129, 0.3)",
        "glow-sm": "0 0 20px rgba(139, 92, 246, 0.2)",
        "card": "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "float": "float 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient-move": "gradient-move 4s ease infinite",
        "fade-in-up": "fade-in-up 0.6s ease both",
        "slide-in-right": "slide-in-right 0.5s ease both",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "typing": "typing 2.5s steps(30) both",
        "orbit": "orbit 8s linear infinite",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "28px",
      },
    },
  },
  plugins: [],
};

export default config;
