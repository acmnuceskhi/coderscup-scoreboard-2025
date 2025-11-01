/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'vsm': '500px', 
      'sm': '600px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      'main-bg': "url('/assets/bg.png')",
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ["Montserrat", 'sans-serif'],
      },
      height: {
        "half": "50vh",
      },
    },
  },
  plugins: [],
}

