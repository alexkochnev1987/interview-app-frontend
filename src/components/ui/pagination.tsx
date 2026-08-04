'use client'

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { buildPaginationItems } from '@/components/ui/pagination-items'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BodyText } from '@/components/ui/text'

const renderStrong = (chunks: ReactNode) => <strong>{chunks}</strong>

export type PaginationProps<TLimit extends number = number> = {
  page: number
  totalPages: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  /** Page-size options to render a "rows per page" select; omit to hide it. */
  limitOptions?: readonly TLimit[]
  onLimitChange?: (limit: TLimit) => void
  limitDisabled?: boolean
  /** Render numbered page buttons with ellipsis instead of the "page X of Y" text. */
  numberedPages?: boolean
}

export function Pagination<TLimit extends number = number>({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  limitOptions,
  onLimitChange,
  limitDisabled = false,
  numberedPages = false,
}: PaginationProps<TLimit>) {
  const t = useTranslations('pagination')

  if (total === 0) return null

  const firstShown = (page - 1) * limit + 1
  const lastShown = Math.min(total, page * limit)

  if (firstShown > total) return null
  const atStart = page <= 1
  const atEnd = page >= totalPages
  const showLimitSelect = Boolean(limitOptions && limitOptions.length > 0 && onLimitChange)
  const paginationItems = numberedPages ? buildPaginationItems(page, totalPages) : null

  return (
    <Inline
      as="nav"
      gap={3}
      align="center"
      justify="between"
      wrap="wrap"
      aria-label={t('ariaLabel')}
    >
      <BodyText size="sm" tone="muted">
        {t.rich('showing', { from: firstShown, to: lastShown, total, strong: renderStrong })}
      </BodyText>
      <Inline gap={3} align="center">
        {showLimitSelect ? (
          <Select
            value={String(limit)}
            disabled={limitDisabled}
            onValueChange={(value) => onLimitChange?.(Number(value) as TLimit)}
          >
            <SelectTrigger
              variant="surface"
              size="md"
              shape="pill"
              width="auto-wide"
              disabled={limitDisabled}
              aria-label={t('pageSizeLabel')}
              className="bg-card"
            >
              <SelectValue placeholder={t('pageSizeLabel')} />
            </SelectTrigger>
            <SelectContent>
              {limitOptions?.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {t('pageSizeOption', { count: size })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
        <Inline gap={1} align="center">
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="icon-sm"
            aria-label={t('firstPage')}
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
            aria-label={t('previousPage')}
            disabled={atStart}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </Button>
        </Inline>
        {paginationItems ? (
          <Inline gap={1} align="center">
            {paginationItems.map((item) =>
              typeof item === 'number' ? (
                <Button
                  key={item}
                  type="button"
                  variant={item === page ? 'default' : 'outline-pill'}
                  shape="pill"
                  size="icon-sm"
                  aria-label={t('goToPage', { page: item })}
                  aria-current={item === page ? 'page' : undefined}
                  disabled={item === page}
                  onClick={() => onPageChange(item)}
                >
                  {item}
                </Button>
              ) : (
                <BodyText key={item} as="span" size="sm" tone="muted">
                  …
                </BodyText>
              ),
            )}
          </Inline>
        ) : (
          <BodyText size="sm" tone="muted">
            {t.rich('pageOf', { page, totalPages, strong: renderStrong })}
          </BodyText>
        )}
        <Inline gap={1} align="center">
          <Button
            type="button"
            variant="outline-pill"
            shape="pill"
            size="icon-sm"
            aria-label={t('nextPage')}
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
            aria-label={t('lastPage')}
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
