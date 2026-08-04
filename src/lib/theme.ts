export type AppTheme = 'innowise' | 'red' | 'blue' | 'purple'

export const DEFAULT_THEME: AppTheme = 'innowise'

const VALID_THEMES: ReadonlySet<string> = new Set<AppTheme>(['innowise', 'red', 'blue', 'purple'])

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && VALID_THEMES.has(value)
}

export function getEnvTheme(): AppTheme {
  const envTheme = process.env.NEXT_PUBLIC_APP_THEME
  if (isAppTheme(envTheme)) {
    return envTheme
  }
  return DEFAULT_THEME
}
