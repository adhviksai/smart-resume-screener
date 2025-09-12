
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', 
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0052cc', 
        'secondary': '#f0f4f8', 
        'accent': '#0065ff', 
        'text-primary': '#172b4d', 
        'text-secondary': '#5e6c84', 
        'border-color': '#dfe1e6',
        'dark-primary': '#4c9aff', 
        'dark-secondary': '#0d1117', 
        'dark-accent': '#58a6ff', 
        'dark-text-primary': '#c9d1d9', 
        'dark-text-secondary': '#8b949e', 
        'dark-border-color': '#30363d',
      }
    },
  },
  plugins: [],
}