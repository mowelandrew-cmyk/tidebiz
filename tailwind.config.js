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
          dark:    '#3655e5',
          light:   '#7a93f8',
        },
        surface: {
          DEFAULT: '#0e0e0c',
          raised:  '#161613',
          card:    '#1d1d1a',
        },
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
      // Sharper geometry — cuts the "bubbly" feel
      borderRadius: {
        'sm':  '4px',
        DEFAULT: '6px',
        'md':  '6px',
        'lg':  '8px',
        'xl':  '10px',
        '2xl': '12px',
        '3xl': '16px',
        'full': '9999px',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%':           { transform: 'translateY(-4px)', opacity: '1' },
        },
      },
      animation: {
        'fade-in-up':     'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in':        'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer':        'shimmer 2.2s linear infinite',
        'scale-in':       'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'typing-dot':     'typingDot 1.2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'expo-out':  'cubic-bezier(0.16, 1, 0.3, 1)',
        'quart-out': 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
      transitionDuration: {
        '80':  '80ms',
        '100': '100ms',
      },
    },
  },
  plugins: [],
}
