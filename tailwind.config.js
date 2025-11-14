/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-orange': '#F97316',
        'brand-orange-hover': '#EA580C',
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // 4-tier typography system
        'text-large': ['4rem', { lineHeight: '1.2', fontWeight: '600' }],      // 64px - Large (slogans)
        'text-medium': ['1.125rem', { lineHeight: '1.6', fontWeight: '500' }], // 18px - Medium (headers/nav)
        'text-small': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],      // 16px - Small (body text)
        'text-xs': ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],     // 14px - Extra Small (disclaimers)
      }
    },
  },
  plugins: [],
}
