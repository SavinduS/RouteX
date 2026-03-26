/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      keyframes: {
        "marquee-custom": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "pulse-custom": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,182,212,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(6,182,212,0)" },
        },
        "float-custom": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "marquee-custom": "marquee-custom 22s linear infinite",
        "pulse-custom": "pulse-custom 2s ease-in-out infinite",
        "float-custom": "float-custom 4s ease-in-out infinite",
      },
      colors: {
        "route-base": "#F1F5F9",
        "route-primary": "#1D4ED8",
        "route-accent": "#06B6D4",
      },
    },
  },
  plugins: [],
};