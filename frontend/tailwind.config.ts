import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0d0d0f",
        surface: "#141418",
        card: "#1a1a20",
        border: "#2a2a35",
        accent: "#7c3aed",
        "accent-light": "#a78bfa",
        muted: "rgba(255,255,255,0.4)",
        faint: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;