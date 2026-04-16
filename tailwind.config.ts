import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        emn: {
          black: "#221f20",
          offwhite: "#f1f1f1",
          green: "#6ebf46",
          "green-mid": "#469042",
          "green-dark": "#18512d",
        },
      },
      fontSize: {
        // Figma tokens
        title: ["96px", { lineHeight: "1" }],
        heading: ["36px", { lineHeight: "1" }],
        mheading: ["24px", { lineHeight: "1" }],
        description: ["24px", { lineHeight: "1.2" }],
      },
      lineHeight: {
        "extra-tight": "1.1",
        "extra-loose": "2.5",
      },
      borderRadius: {
        pill: "28px",
        section: "30px",
        header: "23px",
      },
      boxShadow: {
        header: "1px 8px 27.3px 0px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
