import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#fbf9f8',
        surface: '#fbf9f8',
        'surface-bright': '#fbf9f8',
        'surface-dim': '#dbdad9',
        'surface-container': '#efeded',
        'surface-container-low': '#f5f3f3',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#e9e8e7',
        'surface-container-highest': '#e4e2e2',
        outline: '#71787c',
        'outline-variant': '#c0c8cb',
        'on-surface': '#1b1c1c',
        'on-surface-variant': '#41484b',
        primary: '#002630',
        'primary-container': '#003d4c',
        'on-primary': '#ffffff',
        'on-primary-container': '#78a8b9',
        secondary: '#5f5e5e',
        'secondary-container': '#e5e2e1',
        'on-secondary': '#ffffff',
        tertiary: '#1f2323',
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
