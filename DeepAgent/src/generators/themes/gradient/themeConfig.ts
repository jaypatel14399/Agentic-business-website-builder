import type { ThemeConfig } from '../shared/theme-config-type'

export const themeConfig: ThemeConfig = {
  name: 'Gradient Modern',
  colors: {
    primary: 'rgb(99 102 241)',
    secondary: 'rgb(139 92 246)',
    accent: 'rgb(236 72 153)',
    background: 'rgb(250 250 252)',
    backgroundAlt: 'rgb(255 255 255)',
    text: 'rgb(30 27 75)',
    textMuted: 'rgb(100 100 120)',
    border: 'rgb(230 230 240)',
    gradientFrom: 'rgb(99 102 241)',
    gradientTo: 'rgb(236 72 153)',
    dark: {
      primary: 'rgb(165 180 252)',
      secondary: 'rgb(196 181 253)',
      accent: 'rgb(251 207 232)',
      background: 'rgb(15 15 25)',
      backgroundAlt: 'rgb(30 27 75)',
      text: 'rgb(250 250 255)',
      textMuted: 'rgb(180 180 200)',
      border: 'rgb(60 60 90)',
      gradientFrom: 'rgb(99 102 241)',
      gradientTo: 'rgb(236 72 153)',
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
    borderRadius: '1.5rem',
  },
  mode: ['light', 'dark'],
}
