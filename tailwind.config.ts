import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        "danger-soft": {
          DEFAULT: "hsl(var(--danger-soft))",
          border: "hsl(var(--danger-soft-border))",
          foreground: "hsl(var(--danger-soft-foreground))",
        },
        "warning-soft": {
          DEFAULT: "hsl(var(--warning-soft))",
          border: "hsl(var(--warning-soft-border))",
          foreground: "hsl(var(--warning-soft-foreground))",
        },
        "success-soft": {
          DEFAULT: "hsl(var(--success-soft))",
          border: "hsl(var(--success-soft-border))",
          foreground: "hsl(var(--success-soft-foreground))",
        },
        scrim: "hsl(var(--scrim))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        float: "var(--shadow-float)",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, hsl(var(--primary-container)), hsl(var(--primary)))",
        "hero-glow":
          "radial-gradient(circle at top left, hsl(var(--primary-fixed) / 0.28), transparent 44%), radial-gradient(circle at 85% 14%, hsl(var(--secondary-fixed) / 0.18), transparent 30%)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        heading: ["var(--font-sans)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
