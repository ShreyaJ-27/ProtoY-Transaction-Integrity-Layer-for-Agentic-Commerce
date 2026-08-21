/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#05070A',
        surface: '#0B1118',
        secondary: '#101820',
        ink: '#EAF2F7',
        muted: '#7F929F',
        primary: '#65E6FF',
        ai: '#9B8CFF',
        success: '#36E0A0',
        warning: '#FFB547',
        critical: '#FF5C70',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
      },
      letterSpacing: {
        ultra: '0.28em',
      },
    },
  },
  plugins: [],
};
