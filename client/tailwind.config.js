/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: '#0B0E13',
        surface: '#12161D',
        raised: '#1A1F28',
        hairline: '#262D38',
        hairsoft: '#1C222B',
        bone: '#ECE9E2',
        muted: '#8A8F9C',
        brass: {
          DEFAULT: '#C6A15B',
          soft: '#8A733F',
          bright: '#E0BC7C'
        },
        jade: '#4FA98A',
        wine: '#C1495B',
        denim: '#6C8CB0',
        // legacy aliases kept so nothing breaks if referenced elsewhere
        primary: '#0B0E13',
        secondary: '#C6A15B',
        accent: '#4FA98A'
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      letterSpacing: {
        widest2: '0.2em'
      },
      boxShadow: {
        card: '0 1px 0 rgba(198,161,91,0.06), 0 20px 40px -24px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(198,161,91,0.4), 0 0 24px rgba(198,161,91,0.15)'
      },
      backgroundImage: {
        grain: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")"
      }
    }
  },
  plugins: []
}
