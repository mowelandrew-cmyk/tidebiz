/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#38bdf8',
          dark: '#0ea5e9',
          light: '#7dd3fc',
        },
        surface: {
          DEFAULT: '#111827',
          raised: '#1f2937',
          card: '#1a2332',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
