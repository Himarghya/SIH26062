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
          950: '#ffffff', // Pure card white
          900: '#f8fafc', // Light canvas
          850: '#f1f5f9', // Soft light surface
          800: '#e2e8f0', // Soft border
          700: '#cbd5e1', // Divider
          600: '#94a3b8', // Muted text
          500: '#64748b', // Secondary text
          400: '#475569', // Body text
          300: '#334155', // Subtitle text
          200: '#1e293b', // Header text
          100: '#0f172a', // Bold primary text
          50: '#020617',  // Pitch black
        },
        aurora: {
          emerald: '#059669',
          teal: '#0d9488',
          cyan: '#0284c7',
          amber: '#d97706',
          rose: '#e11d48',
          violet: '#6366f1',
          ice: '#f0fdf4'
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

