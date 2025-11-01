/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'vsm': '500px', // Add this custom screen size
      'sm': '600px',
      ...require('tailwindcss/defaultTheme').screens, // Keep the existing default screens
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

