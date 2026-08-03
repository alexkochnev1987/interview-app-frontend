export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end'

export function buildPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 1) return [1]
  if (totalPages <= 3) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  if (currentPage === 1) {
    return [1, 2, 'ellipsis-end']
  }
  if (currentPage === 2) {
    return Array.from({ length: Math.min(4, totalPages) }, (_, i) => i + 1)
  }
  if (currentPage >= totalPages - 1) {
    const start = Math.max(1, totalPages - 2)
    return [
      'ellipsis-start',
      ...Array.from({ length: totalPages - start + 1 }, (_, i) => start + i),
    ]
  }
  return ['ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end']
}
