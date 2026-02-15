import type { ThemeConfig } from '../shared/theme-config-type'

export const themeConfig: ThemeConfig = {
  name: 'Midnight Glass',
  colors: {
    primary: 'rgb(139 92 246)',
    secondary: 'rgb(124 58 237)',
    accent: 'rgb(167 139 250)',
    background: 'rgb(15 23 42)',
    backgroundAlt: 'rgb(30 41 59)',
    text: 'rgb(248 250 252)',
    textMuted: 'rgb(148 163 184)',
    border: 'rgba(148 163 184 / 0.2)',
    gradientFrom: 'rgb(79 70 229)',
    gradientTo: 'rgb(139 92 246)',
    dark: {
      background: 'rgb(15 23 42)',
      backgroundAlt: 'rgb(30 41 59)',
      text: 'rgb(248 250 252)',
      textMuted: 'rgb(148 163 184)',
    },
  },
  fonts: {
    heading: 'var(--font-inter), system-ui, sans-serif',
    body: 'var(--font-inter), system-ui, sans-serif',
  },
  layout: {
    sectionPaddingY: '5rem',
    sectionPaddingX: '1.5rem',
    maxWidth: '72rem',
    borderRadius: '1.25rem',
  },
  mode: ['dark', 'light'],
}
