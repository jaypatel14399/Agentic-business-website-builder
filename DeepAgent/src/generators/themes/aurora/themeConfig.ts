import type { ThemeConfig } from '../shared/theme-config-type'

export const themeConfig: ThemeConfig = {
  name: 'Aurora Minimal',
  colors: {
    primary: 'rgb(49 46 129)',
    secondary: 'rgb(67 56 202)',
    accent: 'rgb(99 102 241)',
    background: 'rgb(255 255 255)',
    backgroundAlt: 'rgb(248 250 252)',
    text: 'rgb(15 23 42)',
    textMuted: 'rgb(100 116 139)',
    border: 'rgb(226 232 240)',
    gradientFrom: 'rgb(79 70 229)',
    gradientTo: 'rgb(99 102 241)',
    dark: {
      primary: 'rgb(165 180 252)',
      secondary: 'rgb(129 140 248)',
      accent: 'rgb(129 140 248)',
      background: 'rgb(15 23 42)',
      backgroundAlt: 'rgb(30 41 59)',
      text: 'rgb(248 250 252)',
      textMuted: 'rgb(148 163 184)',
      border: 'rgb(51 65 85)',
      gradientFrom: 'rgb(129 140 248)',
      gradientTo: 'rgb(165 180 252)',
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
    borderRadius: '1rem',
  },
  mode: ['light', 'dark'],
}
