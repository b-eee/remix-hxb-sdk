/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}", "./node_modules/react-tailwindcss-select/dist/index.esm.js"],
  theme: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-scrollbar"),
  ],
};
