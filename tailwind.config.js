/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent — stays blue, used sparingly
        accent: {
          DEFAULT: '#4a6cf7',
          dark:    '#3655e5',
          light:   '#7a93f8',
        },
        // Warm charcoal surfaces — no blue undertones
        surface: {
          DEFAULT: '#0e0e0c',   // app background (warm near-black)
          raised:  '#161613',   // elevated surface (navs, headers)
          card:    '#1d1d1a',   // card background
        },
        // Override Tailwind's default cool grays with warm stone-based grays
        // This cascades to every border-gray-*, bg-gray-*, text-gray-* in the app
        gray: {
          50:  '#fafaf9',
          100: '#f5f4f0',
          200: '#e8e6e1',
          300: '#ccc9c2',
          400: '#a09d97',
          500: '#787471',
          600: '#57534e',
          700: '#3d3a35',
          800: '#272420',
          900: '#19170f',
          950: '#0e0c08',
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
