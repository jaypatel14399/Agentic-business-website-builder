import type { ThemeConfig } from '../shared/theme-config-type'

export const themeConfig: ThemeConfig = {
  name: 'Mono Luxe',
  colors: {
    primary: 'rgb(0 0 0)',
    secondary: 'rgb(38 38 38)',
    accent: 'rgb(115 115 115)',
    background: 'rgb(255 255 255)',
    backgroundAlt: 'rgb(250 250 250)',
    text: 'rgb(0 0 0)',
    textMuted: 'rgb(82 82 82)',
    border: 'rgb(229 229 229)',
    gradientFrom: 'rgb(0 0 0)',
    gradientTo: 'rgb(64 64 64)',
    dark: {
      primary: 'rgb(255 255 255)',
      secondary: 'rgb(245 245 245)',
      accent: 'rgb(163 163 163)',
      background: 'rgb(0 0 0)',
      backgroundAlt: 'rgb(10 10 10)',
      text: 'rgb(255 255 255)',
      textMuted: 'rgb(163 163 163)',
      border: 'rgb(38 38 38)',
      gradientFrom: 'rgb(255 255 255)',
      gradientTo: 'rgb(212 212 212)',
    },
  },
  fonts: {
    heading: 'var(--font-inter), system-ui, sans-serif',
    body: 'var(--font-inter), system-ui, sans-serif',
  },
  layout: {
    sectionPaddingY: '6rem',
    sectionPaddingX: '2rem',
    maxWidth: '64rem',
    borderRadius: '0',
  },
  mode: ['light', 'dark'],
}
