/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0e14',
          900: '#0e121a',
          850: '#11161f',
          800: '#131822',
          750: '#171d28',
          700: '#1b2230',
          650: '#1f2738',
          600: '#262f45',
          500: '#2e3950',
          400: '#3b475f',
          300: '#5b6a86',
          200: '#8b97ad',
          100: '#c2c9d6',
        },
        pink: {
          neon: '#ff2a85',
          soft: '#ff6aa8',
          glow: 'rgba(255,42,133,0.55)',
        },
        cyan: {
          neon: '#00f0ff',
          soft: '#5cf5ff',
          glow: 'rgba(0,240,255,0.55)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Rajdhani', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-pink': '0 0 0 1px rgba(255,42,133,0.4), 0 0 18px 0 rgba(255,42,133,0.35)',
        'neon-cyan': '0 0 0 1px rgba(0,240,255,0.4), 0 0 18px 0 rgba(0,240,255,0.35)',
        card: '0 1px 0 0 rgba(255,255,255,0.03), 0 12px 28px -16px rgba(0,0,0,0.8)',
      },
      keyframes: {
        pulseGlow: {
          '0%,100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.2s ease-in-out infinite',
        slideUp: 'slideUp 0.25s ease-out',
        fadeIn: 'fadeIn 0.25s ease-out',
        scaleIn: 'scaleIn 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
