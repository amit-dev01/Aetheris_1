/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}', './login/index.html', './signup/index.html', './dashboard/index.html'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        pencil: '#000000',
        muted: '#F2F2F2',
        accent: '#FF3000',
        secondary: '#000000',
        'post-it': '#F2F2F2',
        swiss: {
          bg: '#FFFFFF',
          fg: '#000000',
          muted: '#F2F2F2',
          accent: '#FF3000',
          border: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        kalam: ['Inter', 'sans-serif'],
        patrick: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        hard: 'none',
        'hard-sm': 'none',
        'hard-lg': 'none',
        'hard-hover': 'none',
      },
    },
  },
  plugins: [],
};
