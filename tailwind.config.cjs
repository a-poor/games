const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx,css}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        surface: colors.gray,
        primary: colors.blue,
        conny: "#f9df6d",
        conng: "#a0c35a",
        connb: "#b0c4ef",
        connp: "#ba81c5",
      },
    },
  },
  plugins: [],
};
