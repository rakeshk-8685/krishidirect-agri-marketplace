/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#143823',
          green: '#166534',
          lightGreen: '#22c55e',
          softGreen: '#f0fdf4',
          amber: '#d97706',
          lightAmber: '#fef3c7',
          cream: '#FAF8F5',
          card: '#ffffff',
          slate: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
