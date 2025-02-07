/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#1d4b0b',
        secondary: '#55833d',
        tertiary: '#8cc342',
        accent: '#393d37',
        background: '#ffffff',
        lima: {
          50: '#f4faeb',
          100: '#e7f4d3',
          200: '#d1eaac',
          300: '#b4da7c',
          400: '#8cc342',
          500: '#78ad35',
          600: '#5c8a26',
          700: '#476a21',
          800: '#3a551f',
          900: '#33481f',
          950: '#19270c',
        },
      },
    },
  },
  plugins: [],
};
