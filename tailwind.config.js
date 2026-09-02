/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spa: {
          50: '#FBF8F6',
          100: '#F6EFEA',
          200: '#EBDCD3',
          300: '#DEC2B3',
          400: '#CCA08A',
          500: '#B87D64',
          600: '#9C624B',
          700: '#7D4C3A',
          800: '#613B2E',
          900: '#482B22',
        },
        sage: {
          50: '#F4F7F4',
          100: '#E6ECE6',
          200: '#CFDACF',
          300: '#B0C2B0',
          400: '#8DA48E',
          500: '#6C876D',
          600: '#536B54',
          700: '#415442',
        },
        gold: {
          400: '#D4AF37',
          500: '#C5A028',
          600: '#AA881E',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(184, 125, 100, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'luxury': '0 20px 40px -10px rgba(72, 43, 34, 0.12), 0 0 1px 1px rgba(184, 125, 100, 0.15)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}


