/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          500: '#0a66c2',
          600: '#004182',
        },
        surface: {
          1: '#f3f2ef',
        },
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
