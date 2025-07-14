// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        fadeSlide: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeSlide: 'fadeSlide 0.5s ease-in-out 1s forwards',
      },
    },
  },

  experimental: {
    optimizeUniversalDefaults: true
  }
};
