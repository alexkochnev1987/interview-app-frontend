const TEMPLATES_ROOT = 'templates' as const

export const templatesRootQueryKey = () => [TEMPLATES_ROOT] as const

// Keyed by locale so a locale switch does not read another locale's cached rows.
export const templatesListQueryKey = (locale: string) =>
  [TEMPLATES_ROOT, 'list', locale] as const
