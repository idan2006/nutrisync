/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e6f4f4',
          100: '#b3dfdf',
          200: '#80c9c9',
          300: '#4db4b4',
          400: '#26a3a3',
          500: '#008080',
          600: '#007373',
          700: '#006363',
          800: '#005252',
          900: '#003f3f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
