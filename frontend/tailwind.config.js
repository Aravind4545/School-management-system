/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0F172A',
        gold: '#D4AF37',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 40px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
};
