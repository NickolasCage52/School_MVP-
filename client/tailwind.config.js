/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Montserrat", "var(--tg-theme-font-family)", "system-ui", "sans-serif"],
        body: ["Montserrat", "var(--tg-theme-font-family)", "system-ui", "sans-serif"],
        heading: ["Poppins", "Montserrat", "var(--tg-theme-font-family)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          "primary-light": "var(--brand-primary-light)",
          secondary: "var(--brand-secondary)",
          "secondary-light": "var(--brand-secondary-light)",
          accent: "var(--brand-accent)",
          "accent-light": "var(--brand-accent-light)",
        },
        tg: {
          bg: "var(--tg-theme-bg-color, var(--surf-1))",
          text: "var(--tg-theme-text-color, var(--text-primary))",
          hint: "var(--tg-theme-hint-color, var(--text-muted))",
          link: "var(--tg-theme-link-color, var(--brand-primary))",
          button: "var(--tg-theme-button-color, var(--brand-primary))",
          "button-text": "var(--tg-theme-button-text-color, #fff)",
          secondary: "var(--tg-theme-secondary-bg-color, var(--surf-2))",
        },
      },
      borderRadius: {
        card: "var(--radius-card, 20px)",
        button: "var(--radius-button, 14px)",
        input: "var(--radius-input, 12px)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        glow: "var(--shadow-glow)",
        "glow-accent": "var(--shadow-glow-accent)",
      },
      backgroundImage: {
        "gradient-hero": "var(--gradient-hero)",
        "gradient-cta": "var(--gradient-cta)",
        "gradient-card": "var(--gradient-card)",
        "gradient-section": "var(--gradient-section)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-down": "slideDown 0.3s ease-out forwards",
        "slide-left-in": "slideLeftIn 0.35s ease-out forwards",
        "slide-right-in": "slideRightIn 0.35s ease-out forwards",
        "scale-in": "scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "success-pop": "successPop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "sheet-up": "sheetUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "confetti-fall": "confettiFall 1.5s ease-out forwards",
        "gradient-shift": "gradientShift 8s ease infinite",
        "float": "float 4s ease-in-out infinite",
        "shine": "shine 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(20px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        slideLeftIn: { "0%": { opacity: "0", transform: "translateX(20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        slideRightIn: { "0%": { opacity: "0", transform: "translateX(-20px)" }, "100%": { opacity: "1", transform: "translateX(0)" } },
        scaleIn: { "0%": { opacity: "0", transform: "scale(0.92)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        pulseSoft: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.88" } },
        successPop: { "0%": { opacity: "0", transform: "scale(0.5)" }, "60%": { transform: "scale(1.08)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        sheetUp: { "0%": { transform: "translateY(100%)" }, "100%": { transform: "translateY(0)" } },
        confettiFall: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: "0" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shine: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      transitionDuration: { 400: "400ms" },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
      },
    },
  },
  plugins: [],
};
