import type { Config } from "tailwindcss";

const config: Config = {
  // Aktifkan dark mode
  darkMode: "class",
  
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // 1. WARNA (LENGKAP UNTUK LOGIN & TEMPLATE)
      colors: {
        // Warna Utama
        primary: "#4A6CF7",
        secondary: "#ECF2FF",
        darkprimary: "#2f50d6", // 👈 Untuk hover tombol login
        
        // Warna Teks
        SlateBlueText: "#8899A8",
        MidnightNavyText: "#090E34",
        "body-secondary": "#959CB1", // 👈 Teks "Not a member yet?"
        dark: "#1D2144",             // 👈 Teks "Sign In" (warna gelap)
        
        // Warna Background & Border
        stroke: "#E2E8F0",           // 👈 Garis pinggir tombol sosmed
        gray: {
           400: "#9CA3AF",           // Placeholder input
        },
        
        // Mode Gelap
        darkmode: "#121723",
        darklight: "#1F2433",        // 👈 Background kotak saat dark mode
        dark_border: "#2E3443",      // Border saat dark mode
        
        // Warna Umum
        border: "#E2E8F0",
        body: "#788293",
        white: "#ffffff",
        black: "#000000",
        transparent: "transparent",
      },
      
      // 2. FONT SIZE
      fontSize: {
        "16": "16px",
        "17": "17px",
        "18": "18px",
        "20": "20px",
        "22": "22px",
        "24": "24px",
        "28": "28px",
        "36": "36px",
        "40": "40px",
        "45": "45px",
        "53": "53px",
        "60": "60px",
        
        // Default Tailwind
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
        "6xl": "4rem",
      },

      // 3. MAX WIDTH
      maxWidth: {
        "1200": "1200px",
        "1170": "1170px",
        "content": "1200px",
      },

      // 4. TRANSITION DURATION
      transitionDuration: {
        "0.4s": "0.4s",
      }
    },
  },
  plugins: [],
};
export default config;