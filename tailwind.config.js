/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#4f78ff',
          600: '#3b63ff',
          700: '#3050e0',
          800: '#2541b8',
          900: '#1e3a8a',
        },
        glass: {
          white:  'rgba(255,255,255,0.62)',
          border: 'rgba(255,255,255,0.75)',
          strong: 'rgba(255,255,255,0.85)',
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
        glass: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.85)',
        'glass-lg': '0 2px 4px rgba(0,0,0,0.04), 0 8px 16px rgba(0,0,0,0.07), 0 32px 64px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.95)',
        'glass-sm': '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)',
        float: '0 8px 24px rgba(79,120,255,0.18), 0 2px 6px rgba(79,120,255,0.12)',
      },
      backdropBlur: {
        glass: '20px',
        'glass-sm': '12px',
      },
      backgroundImage: {
        'mesh-bg': `radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.18) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 20%, rgba(74, 144, 226, 0.15) 0%, transparent 50%),
                    radial-gradient(ellipse at 60% 80%, rgba(147, 51, 234, 0.12) 0%, transparent 50%)`,
        'brand-gradient': 'linear-gradient(135deg, #4f78ff 0%, #a78bfa 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        'amber-gradient': 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
        'rose-gradient': 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
        'purple-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
      },
      animation: {
        'float-in': 'floatIn 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'fade-up': 'fadeUp 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'slide-down': 'slideDown 220ms cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
        'shimmer': 'shimmer 1.8s infinite',
        'pulse-ring': 'pulseRing 2s ease infinite',
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
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(79,120,255,0.25)' },
          '50%':      { boxShadow: '0 0 0 8px rgba(79,120,255,0)' },
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
