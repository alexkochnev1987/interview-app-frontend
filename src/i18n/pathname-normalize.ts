export function normalizePathname(pathname: string): string {
  const collapsed = pathname.replace(/\/{2,}/g, '/')
  if (collapsed.length > 1 && collapsed.endsWith('/')) {
    return collapsed.slice(0, -1)
  }
  return collapsed || '/'
}
