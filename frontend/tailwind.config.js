module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily:{
        poppins:["Poppins","san-serif"],
        mono:["Roboto Mono", "monospace"],
      },
      height:{
        "1/10": "10%",
        "9/10": "90%",
      },
      backgroundColor:{
        "app-black": "#121212"
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}


{/* npx tailwindcss@2 build src/index.css -c tailwind.config.js -o scr/output.css */}
