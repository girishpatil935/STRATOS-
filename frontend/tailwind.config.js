/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── New 3-color brand palette ──────────────────────────
        burgundy: {
          DEFAULT: '#600A1C',
          50:  '#F9E8EB',
          100: '#F0C4CC',
          200: '#D97088',
          300: '#8C1029',
          400: '#600A1C',   // ← brand default
          500: '#420713',
          600: '#28040B',
        },
        // ── Neutral grays (borders, muted text, surfaces) ──────
        neutral: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          150: '#EFEFEF',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm':  '0 1px 2px 0 rgba(0,0,0,0.06)',
        'md':  '0 4px 8px -2px rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'lg':  '0 10px 20px -4px rgba(0,0,0,0.10), 0 4px 8px -4px rgba(0,0,0,0.05)',
        'xl':  '0 20px 32px -6px rgba(0,0,0,0.12), 0 8px 12px -6px rgba(0,0,0,0.06)',
        'inner-sm': 'inset 0 1px 2px 0 rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':   'fadeIn 0.4s ease-out',
        'slide-up':  'slideUp 0.45s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
