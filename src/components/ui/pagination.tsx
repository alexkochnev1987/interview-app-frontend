'use client'

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'

export type PaginationProps = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  if (total === 0) return null

  const firstShown = (page - 1) * limit + 1
  const lastShown = Math.min(total, page * limit)
  const atStart = page <= 1
  const atEnd = page >= totalPages

  return (
    <Inline
      as="nav"
      gap={3}
      align="center"
      justify="between"
      wrap="wrap"
      aria-label="Pagination"
    >
      <BodyText size="sm" tone="muted">
        Showing <strong>{firstShown}</strong>–<strong>{lastShown}</strong> of{' '}
        <strong>{total}</strong>
      </BodyText>
      <Inline gap={2} align="center">
        <Inline gap={1} align="center">
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="icon-sm"
            aria-label="First page"
            disabled={atStart}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft />
          </Button>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="icon-sm"
            aria-label="Previous page"
            disabled={atStart}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
        </Inline>
        <BodyText size="sm" tone="muted">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </BodyText>
        <Inline gap={1} align="center">
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="icon-sm"
            aria-label="Next page"
            disabled={atEnd}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </Button>
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="icon-sm"
            aria-label="Last page"
            disabled={atEnd}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight />
          </Button>
        </Inline>
      </Inline>
    </Inline>
  )
}
