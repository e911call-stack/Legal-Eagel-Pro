/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        body: ["'Plus Jakarta Sans'", 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          300: '#f0c84a', 400: '#d4a017', 500: '#b8860b', 600: '#9a6f08',
        },
        navy: {
          700: '#253450', 800: '#1e2a3e', 900: '#0f172a',
        },
        parchment: { 50: '#fdfcf8', 100: '#f5f4f0', 200: '#eeebdf' },
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out forwards',
        'slide-up':   'slideUp 0.35s ease-out forwards',
        'slide-in-r': 'slideInR 0.3s ease-out forwards',
        'ping-red':   'pingRed 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from:{ opacity:'0' }, to:{ opacity:'1' } },
        slideUp: { from:{ opacity:'0', transform:'translateY(10px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideInR:{ from:{ opacity:'0', transform:'translateX(16px)' }, to:{ opacity:'1', transform:'translateX(0)' } },
        pingRed: { '0%,100%':{ boxShadow:'0 0 0 0 rgba(220,38,38,0.4)' }, '50%':{ boxShadow:'0 0 0 6px rgba(220,38,38,0)' } },
      },
    },
  },
  plugins: [],
};
