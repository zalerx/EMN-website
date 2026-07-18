import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

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
          green: "#6cbe45",
          "green-mid": "#469042",
          "green-dark": "#18512d",
        },
      },
      fontFamily: {
        // Both resolve to CSS variables set by next/font in layout.tsx.
        // Swapping Candu for another face only requires editing app/ui/fonts.ts.
        candu: ["var(--font-candu)", "sans-serif"],
        sans: ["var(--font-schibsted)", "ui-sans-serif", "system-ui", "sans-serif"],
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
      typography: {
        // Article reading theme — used as `prose prose-emn` in markdown-body.
        // h1/h2 use Candu (display face); h3+ stay in Schibsted Grotesk
        // because Candu gets heavy at subheading sizes.
        emn: {
          css: {
            maxWidth: "68ch",
            fontSize: "1.125rem",
            lineHeight: "1.75",
            color: "rgb(35 31 32 / 0.85)",
            h1: {
              fontFamily: "var(--font-candu), sans-serif",
              textTransform: "uppercase",
              lineHeight: "1.1",
              letterSpacing: "-0.025em",
              color: "#231f20",
            },
            h2: {
              fontFamily: "var(--font-candu), sans-serif",
              textTransform: "uppercase",
              lineHeight: "1.1",
              letterSpacing: "-0.025em",
              color: "#231f20",
            },
            h3: { fontWeight: "600", color: "#231f20" },
            h4: { fontWeight: "600", color: "#231f20" },
            a: {
              color: "#6cbe45",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              fontWeight: "600",
            },
            "a:hover": { color: "#469042" },
            blockquote: {
              borderLeftColor: "#6cbe45",
              fontStyle: "italic",
              color: "rgb(35 31 32 / 0.7)",
            },
            code: {
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              backgroundColor: "rgb(35 31 32 / 0.06)",
              borderRadius: "4px",
              padding: "0.15em 0.35em",
              fontWeight: "500",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              backgroundColor: "#231f20",
              borderRadius: "16px",
            },
            "pre code": { backgroundColor: "transparent", padding: "0" },
            strong: { color: "#231f20" },
            hr: { borderColor: "rgb(35 31 32 / 0.15)" },
          },
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
