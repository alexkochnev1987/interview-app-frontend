'use client'

import { X } from 'lucide-react'
import { type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SearchInput } from '@/components/ui/search-input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { StatusPill } from '@/components/ui/status-pill'
import type { InterviewSortField, InterviewSortOrder } from '@/lib/api'


export function InterviewPickerToolbar(props: InterviewPickerToolbarProps) {


    const sortValue = `${sortBy}:${sortOrder}` as `${InterviewSortField}:${InterviewSortOrder}`
    const tToolbar = useTranslations('interviews.library.toolbar')
    const tSort = useTranslations('interviews.library.sort')

    return (
        <Stack gap={3}>
            <SearchInput
                value={q}
                onChange={(event) => onQChange(event.target.value)}
                placeholder={tToolbar('searchPlaceholder')}
            />

            <Inline gap={3} align="center" justify="between" wrap="wrap">
                <Inline gap={2} align="center" wrap="wrap">
                    <StatusPill tone="neutral">
                        {loading ? '…' : tToolbar('resultCount', { count: resultCount })}
                    </StatusPill>
                    {activeChips.map((chip) => (
                        <StatusPill key={chip.key} tone="neutral" casing="chip">
                            <Inline gap={1} align="center">
                                <span>{chip.label}</span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    shape="pill"
                                    size="icon-xxs"
                                    aria-label={tToolbar('removeChipAria', { label: chip.label })}
                                    onClick={chip.onRemove}
                                >
                                    <Icon size="xs">
                                        <X />
                                    </Icon>
                                </Button>
                            </Inline>
                        </StatusPill>
                    ))}
                </Inline>

                <Inline gap={2} align="center" wrap="wrap">
                    {viewToggle}
                    <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v) as InterviewPageSize)}>
                        <SelectTrigger variant="surface" size="md" shape="pill" width="auto-wide">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {INTERVIEW_PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {t('pageSizeOption', { count: size })}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Inline>
            </Inline>
        </Stack>
    )
}
