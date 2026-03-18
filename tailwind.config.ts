import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/composables/**/*.ts',
    './app/app.vue',
  ],
  theme: {
    fontFamily: {
      mono: ['"JetBrains Mono"', 'monospace'],
    },
    extend: {
      colors: {
        editor: {
          bg: 'var(--bg)',
          'bg-dark': 'var(--bg-dark)',
          'bg-highlight': 'var(--bg-highlight)',
          'bg-visual': 'var(--bg-visual)',
          fg: 'var(--fg)',
          'fg-dark': 'var(--fg-dark)',
          'fg-gutter': 'var(--fg-gutter)',
          comment: 'var(--comment)',
          cyan: 'var(--cyan)',
          blue: 'var(--blue)',
          purple: 'var(--purple)',
          orange: 'var(--orange)',
          green: 'var(--green)',
          red: 'var(--red)',
          yellow: 'var(--yellow)',
          teal: 'var(--teal)',
          magenta: 'var(--magenta)',
          terminal: 'var(--terminal)',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
