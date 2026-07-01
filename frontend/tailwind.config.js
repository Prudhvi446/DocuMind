/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
        "text-primary": "var(--color-text-primary)",
        "text-muted": "var(--color-text-muted)",
      },
      fontFamily: {
        display: ['"Hubot Sans"', "sans-serif"],
        body: ['"Public Sans"', "sans-serif"],
      },
      boxShadow: {
        "input-focus": "0 0 0 2px rgba(255, 255, 255, 0.4)",
      },
    },
  },
  plugins: [],
};
