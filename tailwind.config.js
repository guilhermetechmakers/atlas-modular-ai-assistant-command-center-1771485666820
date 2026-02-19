/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
        },
        background: 'rgb(var(--background))',
        'background-secondary': 'rgb(var(--background-secondary))',
        foreground: 'rgb(var(--foreground))',
        'foreground-muted': 'rgb(var(--foreground-muted))',
        'foreground-subdued': 'rgb(var(--foreground-subdued))',
        card: {
          DEFAULT: 'rgb(var(--card))',
          foreground: 'rgb(var(--foreground))',
        },
        border: 'rgb(var(--border))',
        'border-strong': 'rgb(var(--border-strong))',
        input: 'rgb(var(--input))',
        ring: 'rgb(var(--ring))',
        'accent-cyan': 'rgb(var(--accent-cyan))',
        'accent-purple': 'rgb(var(--accent-purple))',
        'accent-pink': 'rgb(var(--accent-pink))',
        'accent-amber': 'rgb(var(--accent-amber))',
        success: 'rgb(var(--success))',
        warning: 'rgb(var(--warning))',
        error: 'rgb(var(--error))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1' }],
      },
      borderRadius: {
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.6)',
        glow: '0 0 20px rgb(var(--primary) / 0.3)',
      },
      transitionDuration: {
        200: '200ms',
        300: '300ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
