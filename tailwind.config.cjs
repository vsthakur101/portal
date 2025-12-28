/** @type {import('tailwindcss').Config} */
const typography = require('@tailwindcss/typography');

module.exports = {
  content: [
    './app/**/*.{ts,tsx,js,jsx,css}',
    './app/globals.css',
    './components/**/*.{ts,tsx,js,jsx,css}',
    './pages/**/*.{ts,tsx,js,jsx,css}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [typography],
};
