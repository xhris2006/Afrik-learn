/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // AfrikLearn Brand — vivid blue palette from the design reference
        brand: {
          50:  '#e8f4ff',
          100: '#c3e0ff',
          200: '#9acbff',
          300: '#6eb4ff',
          400: '#4aa3ff',
          500: '#2693ff',
          600: '#0a7ef0',
          700: '#0065d4',  // primary button
          800: '#004fb0',
          900: '#003a8a',
          950: '#001e50',
        },
        primary: {
          DEFAULT: '#1565C0',
          light: '#1976D2',
          dark: '#0D47A1',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5B',
          dark: '#E5521E',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        // Semantic
        background: '#F0F4FF',
        surface: '#FFFFFF',
        border: '#E2E8F4',
        muted: '#94A3B8',
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
        '3xl': '36px',
      },
      boxShadow: {
        card: '0 2px 16px rgba(21, 101, 192, 0.08)',
        'card-hover': '0 8px 32px rgba(21, 101, 192, 0.18)',
        button: '0 4px 14px rgba(21, 101, 192, 0.35)',
        nav: '0 1px 0 rgba(0,0,0,0.06)',
        glow: '0 0 40px rgba(21, 101, 192, 0.25)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1565C0 0%, #1976D2 50%, #2196F3 100%)',
        'hero-gradient': 'linear-gradient(160deg, #0D47A1 0%, #1565C0 40%, #1976D2 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(21,101,192,0.05) 0%, rgba(33,150,243,0.05) 100%)',
        'premium-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%)',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'fade-in': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'pulse-ring': { '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(21, 101, 192, 0.4)' }, '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(21, 101, 192, 0)' }, '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(21, 101, 192, 0)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
