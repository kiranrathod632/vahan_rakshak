/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0b1220',
        brand: {
          50: '#eff5ff',
          100: '#dbe7fe',
          200: '#bfd5fe',
          300: '#93b8fd',
          400: '#6090fa',
          500: '#3b6cf6',
          600: '#2550eb',
          700: '#1d3fd8',
          800: '#1e35af',
          900: '#1e318a',
          950: '#0f1b4d',
        }
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
