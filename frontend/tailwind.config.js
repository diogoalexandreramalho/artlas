/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial theme — see /tmp/artlas-handoff/artlas/project/styles.css
        // (`:root` block). Add `dark` + `modernist` later as data-attribute
        // overrides if we want to revisit themes.
        ink: '#1a1714',          // primary text
        'ink-2': '#4a4339',      // secondary text
        'ink-3': '#7a7163',      // tertiary text
        bg: '#f3eee3',           // page background (warm sand)
        'bg-2': '#ebe4d4',       // alternating bg, scrollbar thumb
        surface: '#fbf8f1',      // cards, inputs (paper)
        line: 'rgba(26, 23, 20, 0.14)',
        'line-2': 'rgba(26, 23, 20, 0.07)',
        accent: '#0d3ae4',
        'accent-deep': '#0a2bb0',
        'accent-soft': 'rgba(13, 58, 228, 0.10)',
        'label-bg': '#fefcf6',   // mat-board label / artwork-frame surface
      },
      fontFamily: {
        display: ['Cal Sans', 'Helvetica Neue', 'sans-serif'],
        body: [
          'Inter Tight',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 1px 0 rgba(26, 23, 20, 0.04), 0 1px 2px rgba(26, 23, 20, 0.04)',
        lift: '0 1px 0 rgba(26, 23, 20, 0.04), 0 8px 28px rgba(26, 23, 20, 0.08)',
      },
    },
  },
  plugins: [],
};
