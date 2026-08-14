/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // RGB-kanal usuli: bg-primary/10, text-primary/70 kabi
        // shaffoflik modifikatorlari ham ishlaydi.
        primary: {
          DEFAULT: "rgb(var(--primary-color) / <alpha-value>)",
          hover: "rgb(var(--primary-hover) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
