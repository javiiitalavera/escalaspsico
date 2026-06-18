/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          50:  '#e8f4fd',
          100: '#d0e9fa',
          200: '#a1d3f5',
          500: '#5b9bd5',
          600: '#3a7abf',
          700: '#2d6099',
          900: '#1e3a5a',
        },
        accent: {
          50:  '#e0f5f5',
          100: '#b8e8e8',
          500: '#2aafaf',
          600: '#1f8a8a',
        },
        warm: {
          50:  '#fdf8f0',
          100: '#fdebd0',
          500: '#f5a623',
        },
        surface: '#fdf8f0',
        card: '#ffffff',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
      }
    },
  },
  plugins: [],
}
