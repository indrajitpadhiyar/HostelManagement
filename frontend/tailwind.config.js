/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./data/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          subtle: '#EFF6FF',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        textPrimary: '#0F172A',
        textSecondary: '#64748B',
        textMuted: '#94A3B8',
        border: '#E2E8F0',
        borderLight: '#F1F5F9',
        success: {
          DEFAULT: '#16A34A',
          subtle: '#DCFCE7',
          dark: '#15803D',
        },
        warning: {
          DEFAULT: '#F59E0B',
          subtle: '#FEF3C7',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#DC2626',
          subtle: '#FEE2E2',
          dark: '#B91C1C',
        },
      },
    },
  },
  plugins: [],
};
