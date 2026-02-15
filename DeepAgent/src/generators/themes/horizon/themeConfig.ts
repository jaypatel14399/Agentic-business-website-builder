import type { ThemeConfig } from '../shared/theme-config-type'

export const themeConfig: ThemeConfig = {
  name: 'Horizon Editorial',
  colors: {
    primary: 'rgb(41 37 36)',
    secondary: 'rgb(68 64 60)',
    accent: 'rgb(120 113 108)',
    background: 'rgb(245 245 244)',
    backgroundAlt: 'rgb(255 255 255)',
    text: 'rgb(28 25 23)',
    textMuted: 'rgb(87 83 78)',
    border: 'rgb(214 211 209)',
    gradientFrom: 'rgb(41 37 36)',
    gradientTo: 'rgb(68 64 60)',
    dark: {
      primary: 'rgb(250 250 249)',
      secondary: 'rgb(231 229 228)',
      accent: 'rgb(168 162 158)',
      background: 'rgb(28 25 23)',
      backgroundAlt: 'rgb(41 37 36)',
      text: 'rgb(250 250 249)',
      textMuted: 'rgb(168 162 158)',
      border: 'rgb(64 61 59)',
      gradientFrom: 'rgb(250 250 249)',
      gradientTo: 'rgb(214 211 209)',
    },
  },
  fonts: {
    heading: 'var(--font-playfair), Georgia, serif',
    body: 'var(--font-inter), system-ui, sans-serif',
  },
  layout: {
    sectionPaddingY: '6rem',
    sectionPaddingX: '2rem',
    maxWidth: '80rem',
    borderRadius: '0.5rem',
  },
  mode: ['light', 'dark'],
}
