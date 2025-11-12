/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#12033A",
          light: "#354eab",
        },
        accent: {
          DEFAULT: "#0047FF",
          light: "#3388f3",
        },
        success: "#3388f3",
        background: "#F1F3FA",
      },
    },
  },
  plugins: [],
};
