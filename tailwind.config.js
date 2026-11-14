/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core OMNI Ecosystem Foundation Tokens
        midnight: {
          DEFAULT: '#171A2B',
          50: '#FFFFFF',
          100: '#F5F6FA', // Soft White (Common Primary Text)
          200: '#E4E7F2',
          300: '#B8BDD3',
          400: '#8B91A7', // Slate Grey (Common Secondary/Borders)
          500: '#6D738B',
          600: '#4E546E',
          700: '#313752',
          800: '#1E2238', // Elevated Surface / Card
          850: '#1A1E32',
          900: '#171A2B', // Midnight Navy (Common Base)
          950: '#111322', // Deep Midnight
        },
        omni: {
          navy: '#171A2B',      // Midnight Navy
          white: '#F5F6FA',     // Soft White
          slate: '#8B91A7',     // Slate Grey
          surface: '#1E2238',   // Elevated Card / Modal Surface
          surfaceHover: '#252A44',
          border: 'rgba(139, 145, 167, 0.16)',
          // Time Accent: Purple (Calm and Focus)
          accent: '#7867D8',
          accentHover: '#8C7DE3',
          accentDark: '#6855CB',
          accentSubtle: 'rgba(120, 103, 216, 0.15)',
        },
        // OMNI Time Signature Accent: Purple (Calm & Focus #7867D8)
        purple: {
          50: '#F6F5FC',
          100: '#EDEAF9',
          200: '#DDD8F4',
          300: '#BCB1EB',
          400: '#9686E2',
          500: '#7867D8', // Calm Purple Signature
          600: '#6855CB',
          700: '#5843BE',
          800: '#46339E',
          900: '#322378',
          950: '#1D144A',
        },
        // Map indigo smoothly to the Purple spectrum for instant harmony
        indigo: {
          50: '#F6F5FC',
          100: '#EDEAF9',
          200: '#DDD8F4',
          300: '#BCB1EB',
          400: '#9686E2',
          500: '#7867D8', // Calm Purple Signature
          600: '#6855CB',
          700: '#5843BE',
          800: '#46339E',
          900: '#322378',
          950: '#1D144A',
        },
        // Map slate so that base UI automatically uses Midnight Navy & Slate Grey
        slate: {
          50: '#FFFFFF',
          100: '#F5F6FA', // Soft White (Primary Text)
          200: '#E4E7F2',
          300: '#B8BDD3',
          400: '#8B91A7', // Slate Grey (Secondary Text & Muted Icons)
          500: '#6D738B',
          600: '#4E546E',
          700: '#313752',
          800: '#1E2238', // Elevated Surface
          850: '#1A1E32',
          900: '#171A2B', // Midnight Navy Base
          950: '#111322', // Deep Midnight
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
