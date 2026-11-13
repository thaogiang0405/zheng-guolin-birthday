/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sunshine: "#F6CE4B",
        sky: "#A9DDF1",
        cream: "#FFF5E4",
        ink: "#29282C",
        champagne: "#D7AC64",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(74, 55, 27, 0.12)",
      },
    },
  },
  plugins: [],
};
