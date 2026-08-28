/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light brown + white brand palette
        cream: {
          50: '#FBF8F4',
          100: '#F5EFE7',
          200: '#EDE2D3',
          300: '#E0CDB5',
          400: '#D0B896',
          500: '#C2A578',
          600: '#A98660',
          700: '#8A6B4A',
          800: '#6E5439',
          900: '#4E3B27',
        },
        bark: {
          400: '#8A6B4A',
          500: '#6E5439',
          600: '#5A4530',
          700: '#463524',
        },
        sand: {
          50: '#FAF6F0',
          100: '#F2EBE0',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
