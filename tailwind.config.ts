import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Arc Raiders Official Colors
        'arc-white': '#ece2d0',
        'arc-blue': '#130918',
        'arc-yellow': '#f1aa1c',
        'arc-blue-light': '#1a1120',
        'arc-blue-lighter': '#2d1f38',
      },
      fontFamily: {
        barlow: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'texture-grain': "url('/texture-grain.png')",
      },
    },
  },
  plugins: [],
};
export default config;
