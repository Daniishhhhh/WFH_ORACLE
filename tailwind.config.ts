import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        ink: '6px 6px 0 rgba(15, 23, 42, 0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
