/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff0f0',
          100: '#ffe0e0',
          200: '#ffb3b3',
          300: '#ff8080',
          400: '#ff4d4d',
          500: '#e63030',
          600: '#cc1f1f',
          700: '#a61414',
          800: '#800d0d',
          900: '#590808',
        },
        surface: {
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#222222',
          500: '#2e2e2e',
          400: '#3a3a3a',
          300: '#4a4a4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'Fira Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
      },
      boxShadow: {
        glass:    '0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.35), 0 12px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg': '0 2px 4px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.45), 0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glass-sm': '0 1px 2px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
        float:    '0 8px 24px rgba(230,48,48,0.25), 0 2px 6px rgba(230,48,48,0.15)',
        'float-red': '0 0 0 1px rgba(230,48,48,0.3), 0 8px 32px rgba(230,48,48,0.3), 0 2px 8px rgba(0,0,0,0.4)',
        'glow-red': '0 0 20px rgba(230,48,48,0.4), 0 0 40px rgba(230,48,48,0.2)',
      },
      backdropBlur: {
        glass: '24px',
        'glass-sm': '12px',
      },
      backgroundImage: {
        'mesh-bg': `
          radial-gradient(ellipse at 20% 30%, rgba(230,48,48,0.10) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 70%, rgba(180,20,20,0.08) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 100%, rgba(230,48,48,0.06) 0%, transparent 50%)
        `,
        'brand-gradient': 'linear-gradient(135deg, #e63030 0%, #ff6b6b 100%)',
        'dark-gradient':  'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
        'card-gradient':  'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        'red-glow':       'radial-gradient(circle, rgba(230,48,48,0.15) 0%, transparent 70%)',
      },
      animation: {
        'float-in':   'floatIn 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-up':    'fadeUp 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-down': 'slideDown 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'shimmer':    'shimmer 1.8s infinite',
        'pulse-ring': 'pulseRing 2s ease infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        floatIn: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-8px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(230,48,48,0.3)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(230,48,48,0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
};
