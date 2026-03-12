/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'route-base': '#F1F5F9',
        'route-primary': '#1D4ED8',
        'route-accent': '#06B6D4',
      },
    },
  },
  plugins: [],
}