/**
 * Random theme selection utility.
 * Used at build time by the generator (Python: theme_utils.select_theme).
 * This TS version can be used for client-side preview or tooling.
 */

export const THEME_IDS = ['aurora', 'midnight', 'horizon', 'mono', 'gradient'] as const
export type ThemeId = (typeof THEME_IDS)[number]

/**
 * Select a theme deterministically from a seed string (e.g. business slug + name).
 * Returns the same theme for the same seed.
 */
export function selectThemeFromSeed(seed: string): ThemeId {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  const idx = Math.abs(h) % THEME_IDS.length
  return THEME_IDS[idx]
}

/**
 * Select a theme at random (for one-off preview or demos).
 */
export function selectRandomTheme(): ThemeId {
  return THEME_IDS[Math.floor(Math.random() * THEME_IDS.length)]
}
