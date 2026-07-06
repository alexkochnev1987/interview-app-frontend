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
  QUESTION_PAGE_LIMIT_OPTIONS,
  type QuestionPageLimit,
} from '@/lib/questions-query-state'

export type QuestionPageSizeSelectProps = {
  limit: number
  onLimitChange: (limit: QuestionPageLimit) => void
  disabled?: boolean
}

export function QuestionPageSizeSelect({
  limit,
  onLimitChange,
  disabled = false,
}: QuestionPageSizeSelectProps) {
  const t = useTranslations('questions.picker.toolbar')

  return (
    <Select
      value={String(limit)}
      disabled={disabled}
      onValueChange={(value) => onLimitChange(Number(value) as QuestionPageLimit)}
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
        {QUESTION_PAGE_LIMIT_OPTIONS.map((size) => (
          <SelectItem key={size} value={String(size)}>
            {t('pageSizeOption', { count: size })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
