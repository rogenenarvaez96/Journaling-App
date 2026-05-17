/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0b0c10',
          elevated: '#12131c',
        },
        terracotta: {
          DEFAULT: '#d97736',
        },
        stone: {
          DEFAULT: '#f7f6f3',
        },
        parchment: {
          DEFAULT: '#fafaf9',
        },
        amethyst: {
          DEFAULT: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
