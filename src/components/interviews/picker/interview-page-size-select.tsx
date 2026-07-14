'use client'

import { useTranslations } from 'next-intl'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  INTERVIEW_PAGE_LIMIT_OPTIONS,
  type InterviewPageLimit,
} from '@/lib/interviews-query-state'

export type InterviewPageSizeSelectProps = {
  limit: number
  onLimitChange: (limit: InterviewPageLimit) => void
  disabled?: boolean
}

export function InterviewPageSizeSelect({
  limit,
  onLimitChange,
  disabled = false,
}: InterviewPageSizeSelectProps) {
  const t = useTranslations('interviews.library.toolbar')

  return (
    <Select
      value={String(limit)}
      disabled={disabled}
      onValueChange={(value) => onLimitChange(Number(value) as InterviewPageLimit)}
    >
      <SelectTrigger
        variant="surface"
        size="md"
        shape="pill"
        width="auto-wide"
        disabled={disabled}
        aria-label={t('pageSizeLabel')}
      >
        <SelectValue placeholder={t('pageSizeLabel')} />
      </SelectTrigger>
      <SelectContent>
        {INTERVIEW_PAGE_LIMIT_OPTIONS.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {t('pageSizeOption', { count: size })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
