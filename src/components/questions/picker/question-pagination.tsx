'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { BodyText } from '@/components/ui/text'

export type QuestionPaginationProps = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function QuestionPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: QuestionPaginationProps) {
  if (total === 0) return null

  const firstShown = (page - 1) * limit + 1
  const lastShown = Math.min(total, page * limit)

  return (
    <Inline gap={3} align="center" justify="between" wrap="wrap">
      <BodyText size="sm" tone="muted">
        Showing <strong>{firstShown}</strong>–<strong>{lastShown}</strong> of{' '}
        <strong>{total}</strong>
      </BodyText>
      <Inline gap={2} align="center">
        <Button
          type="button"
          variant="outline-pill"
          shape="pill"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <BodyText size="sm" tone="muted">
          Page <strong>{page}</strong> of <strong>{totalPages}</strong>
        </BodyText>
        <Button
          type="button"
          variant="outline-pill"
          shape="pill"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </Inline>
    </Inline>
  )
}
