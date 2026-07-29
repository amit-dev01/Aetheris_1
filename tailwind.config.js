/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#fdfbf7',
        pencil: '#2d2d2d',
        muted: '#e5e0d8',
        accent: '#ff4d4d',
        secondary: '#2d5da1',
        'post-it': '#fff9c4',
      },
      fontFamily: {
        kalam: ['Kalam', 'cursive'],
        patrick: ['"Patrick Hand"', 'cursive'],
      },
      boxShadow: {
        hard: '4px 4px 0px 0px #2d2d2d',
        'hard-sm': '3px 3px 0px 0px rgba(45, 45, 45, 0.15)',
        'hard-lg': '8px 8px 0px 0px #2d2d2d',
        'hard-hover': '2px 2px 0px 0px #2d2d2d',
      },
    },
  },
  plugins: [],
};
