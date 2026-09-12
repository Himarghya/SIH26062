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
        slate: {
          400: '#475569', // Darkened from #94a3b8 for clear secondary text
          500: '#334155', // Darkened from #64748b for crisp subtitle & label text
          600: '#1e293b', // Darkened from #475569 for high-contrast body text
          700: '#0f172a', // Darkened from #334155 for prominent text
          800: '#090d16', // Darkened from #1e293b for bold headers
          900: '#020617', // Pitch black primary text
        },
        polar: {
          950: '#ffffff', // Pure card white
          900: '#f8fafc', // Light canvas
          850: '#f1f5f9', // Soft light surface
          800: '#e2e8f0', // Soft border
          700: '#cbd5e1', // Divider
          600: '#475569', // Darkened muted text
          500: '#334155', // Darkened secondary text
          400: '#1e293b', // Darkened body text
          300: '#0f172a', // Darkened subtitle text
          200: '#0f172a', // Header text
          100: '#020617', // Bold primary text
          50: '#000000',  // Pitch black
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

