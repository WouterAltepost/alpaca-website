/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/*.html', './src/i18n/*.json', './build.mjs'],
  theme: {
    extend: {
      colors: {
        canvas:  '#FAF8F4',
        surface: '#F3EFE8',
        card:    '#FFFFFF',
        raised:  '#FFFFFF',
        border:  'rgba(26,22,19,0.08)',
        accent:  '#F09537',
        'accent-dim': 'rgba(240,149,55,0.12)',
        'accent-glow': 'rgba(240,149,55,0.25)',
        ink:     '#1A1613',
        muted:   '#5A544D',
        subtle:  '#A39D94',
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body:    ['Plus Jakarta Sans', 'sans-serif'],
      },
      letterSpacing: {
        tight3: '-0.03em',
        tight4: '-0.04em',
        tight5: '-0.05em',
      },
    },
  },
  plugins: [],
};
