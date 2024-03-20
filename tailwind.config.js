module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {},
    screens: {
      "quatro": '400px',
      "cinco": '500px',
      "seis": '600px',
      "oito": '800px',
      "mil": '1000px',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
