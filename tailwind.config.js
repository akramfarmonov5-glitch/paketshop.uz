/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        gold: {
          400: '#EF4444', // Red 400
          500: '#DC2626', // Red 500
          600: '#B91C1C', // Red 600
        },
        dark: {
          900: '#0f0f0f',
          800: '#1a1a1a',
        },
        light: {
          bg: '#FFFBF5',
          card: '#F5F5F7',
          text: '#1A1A1A',
          muted: '#6B7280',
          border: '#E5E5E5',
        }
      }
    },
  },
  plugins: [],
}

