/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        clinical: {
          50: '#f4faff',
          100: '#e8f4ff',
          500: '#2f80ed',
          600: '#1f6ed4',
          700: '#1453a3'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(17, 24, 39, 0.08)'
      }
    }
  },
  plugins: []
};
