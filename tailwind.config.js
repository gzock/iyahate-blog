/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mincho: [
          "Hiragino Mincho ProN",
          "ヒラギノ明朝 ProN W6",
          "Hiragino Mincho Pro",
          "ヒラギノ明朝 Pro",
          "HG明朝E",
          "ＭＳ Ｐ明朝",
          "MS PMincho",
        ],
      },
    },
  },
  plugins: [],
};
