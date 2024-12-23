/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        light: "rgba(var(--foreground), 0.25)",
        lighter: "rgba(var(--foreground), 0.15)",
        lightest: "rgba(var(--foreground), 0.1)",
        medium: "rgba(var(--foreground), 0.35)",
        gray: "rgba(var(--gray), 1)",
        glass: "rgba(var(--gray), 0.6)",
      },
      borderColor: {
        DEFAULT: "rgba(var(--foreground), 0.15)",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",
        lg: "0.75rem",
        xl: "1.7rem",
      },
    },
  },
  plugins: [],
};
