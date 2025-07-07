/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Custom colors using CSS variables
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'border-primary': 'var(--border-primary)',
        'border-secondary': 'var(--border-secondary)',
        'card-bg': 'var(--card-bg)',
        'modal-bg': 'var(--modal-bg)',
        'input-bg': 'var(--input-bg)',
        'input-border': 'var(--input-border)',
        'primary-custom': 'var(--primary)',
        'primary-hover': 'var(--primary-hover)',
        'secondary-custom': 'var(--secondary)',
        'success-custom': 'var(--success)',
        'warning-custom': 'var(--warning)',
        'danger-custom': 'var(--danger)',
      },
      boxShadow: {
        'custom': '0 4px 6px -1px var(--shadow), 0 2px 4px -1px var(--shadow)',
        'custom-lg': '0 10px 15px -3px var(--shadow), 0 4px 6px -2px var(--shadow)',
      },
      keyframes: {
        'fade-in-scale': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.95)',
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'theme-transition': {
          '0%': { opacity: '0.8' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in-scale': 'fade-in-scale 0.2s ease-out forwards',
        'theme-transition': 'theme-transition 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
}
