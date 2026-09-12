/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        polar: {
          950: '#060d19',
          900: '#0a1628',
          850: '#0e1e36',
          800: '#132845',
          700: '#1b3a61',
          600: '#255085',
          500: '#3472ba',
          400: '#5c97e6',
          300: '#8dbdf5',
          200: '#c2defb',
          100: '#e5f1fd',
          50: '#f4f8fe',
        },
        aurora: {
          cyan: '#00f2fe',
          teal: '#4facfe',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          ice: '#e0f2fe'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blizzard': 'blizzard 20s linear infinite',
      },
      keyframes: {
        blizzard: {
          '0%': { transform: 'translateY(0) translateX(0)' },
          '100%': { transform: 'translateY(100vh) translateX(-50vw)' },
        }
      }
    },
  },
  plugins: [],
}
