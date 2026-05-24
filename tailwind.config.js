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
          DEFAULT: '#4a6cf7',
          dark: '#3655e5',
          light: '#7a93f8',
        },
        surface: {
          DEFAULT: '#0f1117',
          raised: '#161b28',
          card: '#131825',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
