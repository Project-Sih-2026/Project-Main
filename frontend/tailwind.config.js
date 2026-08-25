/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          base: "#081522",
          panel: "#0E2233",
          card: "#132C40",
          cardHover: "#193852",
          border: "rgba(40, 184, 216, 0.18)",
          cyan: "#28B8D8",
          teal: "#56D6B0",
          green: "#42C98A",
          amber: "#F3B63F",
          coral: "#E86A67",
          textPrimary: "#F0F4F8",
          textSecondary: "#8B9EB0",
          textMuted: "#5E758A"
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Consolas", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    },
  },
  plugins: [],
}
