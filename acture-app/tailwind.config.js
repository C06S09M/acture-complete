/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: "#8BC34A", dark: "#689F38", light: "#F1F8E9" },
      },
    },
  },
  plugins: [],
};
