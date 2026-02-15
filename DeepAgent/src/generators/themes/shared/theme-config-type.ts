/**
 * Shared type for theme configuration.
 */

export interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    backgroundAlt: string
    text: string
    textMuted: string
    border: string
    gradientFrom: string
    gradientTo: string
    /** Dark mode overrides (used when .dark is on root) */
    dark?: Partial<Record<string, string>>
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    sectionPaddingY: string
    sectionPaddingX: string
    maxWidth: string
    borderRadius: string
  }
  mode: ('light' | 'dark')[]
}
