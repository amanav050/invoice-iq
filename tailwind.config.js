/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#06080F',
        'base-light': '#0A0E1A',
        surface: '#111627',
        'surface-2': '#181D33',
        'surface-3': '#1E2440',
        'surface-4': '#252B4A',
        border: 'rgba(255, 255, 255, 0.06)',
        accent: '#6366F1',
        'accent-light': '#818CF8',
        'accent-dark': '#4F46E5',
        purple: { 400: '#A78BFA', 500: '#8B5CF6' },
        blue: '#3B82F6',
        success: '#10B981',
        'success-dim': '#065F46',
        warning: '#F59E0B',
        'warning-dim': '#78350F',
        danger: '#EF4444',
        'danger-dim': '#7F1D1D',
        muted: '#4B5574',
        'muted-light': '#8892B0',
        text: '#E2E8F0',
        'text-secondary': '#A0AECB',
        'text-bright': '#F8FAFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'gradient': 'gradient-shift 8s ease infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}