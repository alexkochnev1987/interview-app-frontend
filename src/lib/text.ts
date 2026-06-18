export function readSearchParamToken(
  value: string | string[] | undefined,
): string {
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return (value[0] ?? '').trim()
  return ''
}

export function truncateText(value: string, maxLength = 138) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trimEnd()}...`
}
