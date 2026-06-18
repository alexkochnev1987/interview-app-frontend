'use client'

import { RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FacetRowButton } from '@/components/ui/facet-row-button'
import { IconAffix } from '@/components/ui/icon-affix'
import { Input } from '@/components/ui/input'
import { Inline } from '@/components/ui/layout/inline'
import { DividedStack, DividedStackItem } from '@/components/ui/layout/divided-stack'
import { Stack } from '@/components/ui/layout/stack'
import { ShowMoreToggle } from '@/components/ui/show-more-toggle'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import type {
  FacetCount,
  QuestionDifficulty,
  QuestionStatusFilter,
} from '@/lib/api'
import { useToastMessages } from '@/lib/use-toast-messages'

const COLLAPSED_LIMIT = 6
const TAG_COLLAPSED_LIMIT = 12

export type QuestionFacetSidebarProps = {
  difficulties: FacetCount[]
  categories: FacetCount[]
  subcategories: FacetCount[]
  roles: FacetCount[]
  tags: FacetCount[]
  selected: {
    difficulty?: QuestionDifficulty
    category?: string
    subcategory?: string
    role?: string
    tags: string[]
    status: QuestionStatusFilter
  }
  onDifficultyChange: (value: QuestionDifficulty | undefined) => void
  onCategoryChange: (value: string | undefined) => void
  onSubcategoryChange: (value: string | undefined) => void
  onRoleChange: (value: string | undefined) => void
  onTagsChange: (value: string[]) => void
  onStatusChange: (value: QuestionStatusFilter) => void
  onReset: () => void
  canReset: boolean
  showStatusFilter: boolean
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function QuestionFacetSidebar(props: QuestionFacetSidebarProps) {
  const {
    difficulties,
    categories,
    subcategories,
    roles,
    tags,
    selected,
    onDifficultyChange,
    onCategoryChange,
    onSubcategoryChange,
    onRoleChange,
    onTagsChange,
    onStatusChange,
    onReset,
    canReset,
    showStatusFilter,
    loading,
    error,
    onRetry,
  } = props
  const toastMessages = useToastMessages()
  const t = useTranslations('questions.picker.facet')

  const activeFilterCount =
    (selected.difficulty ? 1 : 0) +
    (selected.category ? 1 : 0) +
    (selected.subcategory ? 1 : 0) +
    (selected.role ? 1 : 0) +
    selected.tags.length +
    (showStatusFilter && selected.status !== 'active' ? 1 : 0)

  return (
    <Card variant="surface" size="sm">
      <CardContent spacing="md">
        <Stack gap={3}>
          <Inline gap={2} align="center" justify="between">
            <BodyText
              as="span"
              size="base"
              tone="foreground"
              weight="semibold"
            >
              {t('filtersTitle')}
            </BodyText>
            {activeFilterCount > 0 ? (
              <BodyText as="span" size="xs" tone="muted">
                {t('activeFilters', { count: activeFilterCount })}
              </BodyText>
            ) : null}
          </Inline>

          <Button
            type="button"
            variant="default"
            shape="pill"
            size="xl"
            width="full"
            disabled={!canReset}
            onClick={onReset}
            title={t('resetTitle')}
          >
            <RotateCcw className="size-4" />
            {activeFilterCount > 0
              ? t('resetAllWithCount', { count: activeFilterCount })
              : t('resetAll')}
          </Button>

          {error ? (
            <Stack gap={2}>
              <BodyText size="sm" weight="semibold">
                {toastMessages.questionFacets.unavailableTitle}
              </BodyText>
              <BodyText size="sm" tone="muted">
                {error}
              </BodyText>
              <Button
                type="button"
                variant="outline-pill"
                shape="pill"
                size="sm"
                onClick={onRetry}
              >
                {t('retry')}
              </Button>
            </Stack>
          ) : null}
        </Stack>

        <DividedStack>
          {showStatusFilter ? (
            <StatusFacetSection
              selected={selected.status}
              onChange={onStatusChange}
            />
          ) : null}

          <ScalarFacetSection
            title={t('difficultyTitle')}
            values={difficulties}
            selected={selected.difficulty}
            onChange={(value) =>
              onDifficultyChange(value as QuestionDifficulty | undefined)
            }
            loading={loading && difficulties.length === 0}
          />
          <ScalarFacetSection
            title={t('categoryTitle')}
            values={categories}
            selected={selected.category}
            onChange={onCategoryChange}
            loading={loading && categories.length === 0}
          />
          <ScalarFacetSection
            title={t('typeTitle')}
            values={subcategories}
            selected={selected.subcategory}
            onChange={onSubcategoryChange}
            loading={loading && subcategories.length === 0}
          />
          <ScalarFacetSection
            title={t('roleTitle')}
            values={roles}
            selected={selected.role}
            onChange={onRoleChange}
            loading={loading && roles.length === 0}
          />
          <TagsFacetSection
            values={tags}
            selected={selected.tags}
            onChange={onTagsChange}
            loading={loading && tags.length === 0}
          />
        </DividedStack>
      </CardContent>
    </Card>
  )
}

function ScalarFacetSection(props: {
  title: string
  values: FacetCount[]
  selected: string | undefined
  onChange: (value: string | undefined) => void
  loading: boolean
}) {
  const { title, values, selected, onChange, loading } = props
  const t = useTranslations('questions.picker.facet')
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? values : values.slice(0, COLLAPSED_LIMIT)
  const hidden = Math.max(0, values.length - visible.length)
  const activeCount = selected ? 1 : 0

  return (
    <FacetSection title={title} activeCount={activeCount}>
      {loading ? (
        <BodyText size="sm" tone="muted">
          {t('loading')}
        </BodyText>
      ) : values.length === 0 ? (
        <BodyText size="sm" tone="muted">
          {t('noValues')}
        </BodyText>
      ) : (
        <Stack gap={1}>
          {visible.map((item) => {
            const isSelected = selected === item.value
            return (
              <FacetRowButton
                key={item.value}
                label={item.value}
                trailing={item.count}
                state={isSelected ? 'selected' : 'default'}
                onClick={() => onChange(isSelected ? undefined : item.value)}
              />
            )
          })}
          {hidden > 0 ? (
            <ShowMoreToggle expanded={false} onClick={() => setExpanded(true)}>
              {t('showAll', { count: values.length })}
            </ShowMoreToggle>
          ) : null}
          {expanded && values.length > COLLAPSED_LIMIT ? (
            <ShowMoreToggle expanded onClick={() => setExpanded(false)}>
              {t('showFewer')}
            </ShowMoreToggle>
          ) : null}
        </Stack>
      )}
    </FacetSection>
  )
}

function TagsFacetSection(props: {
  values: FacetCount[]
  selected: string[]
  onChange: (value: string[]) => void
  loading: boolean
}) {
  const { values, selected, onChange, loading } = props
  const t = useTranslations('questions.picker.facet')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(false)

  const trimmed = search.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      trimmed.length > 0
        ? values.filter((item) => item.value.toLowerCase().includes(trimmed))
        : values,
    [values, trimmed],
  )

  const visible =
    expanded || trimmed.length > 0
      ? filtered
      : filtered.slice(0, TAG_COLLAPSED_LIMIT)
  const hidden = Math.max(0, filtered.length - visible.length)

  function toggleTag(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <FacetSection title={t('tagsTitle')} activeCount={selected.length}>
      <Stack gap={2}>
        <IconAffix icon={<Search className="size-3.5" />}>
          <Input
            type="search"
            size="md"
            shape="pill"
            iconAffix="leading"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('tagSearchPlaceholder')}
          />
        </IconAffix>
        {loading ? (
          <BodyText size="sm" tone="muted">
            {t('loading')}
          </BodyText>
        ) : filtered.length === 0 ? (
          <BodyText size="sm" tone="muted">
            {trimmed.length > 0 ? t('noMatchingTags') : t('noTagsInWorkspace')}
          </BodyText>
        ) : (
          <Stack gap={1}>
            {visible.map((item) => {
              const isSelected = selected.includes(item.value)
              return (
                <FacetRowButton
                  key={item.value}
                  label={item.value}
                  trailing={item.count}
                  state={isSelected ? 'selected' : 'default'}
                  onClick={() => toggleTag(item.value)}
                />
              )
            })}
            {hidden > 0 && trimmed.length === 0 ? (
              <ShowMoreToggle expanded={false} onClick={() => setExpanded(true)}>
                {t('showAll', { count: filtered.length })}
              </ShowMoreToggle>
            ) : null}
            {expanded &&
            filtered.length > TAG_COLLAPSED_LIMIT &&
            trimmed.length === 0 ? (
              <ShowMoreToggle expanded onClick={() => setExpanded(false)}>
                {t('showFewer')}
              </ShowMoreToggle>
            ) : null}
          </Stack>
        )}
      </Stack>
    </FacetSection>
  )
}

function StatusFacetSection(props: {
  selected: QuestionStatusFilter
  onChange: (value: QuestionStatusFilter) => void
}) {
  const { selected, onChange } = props
  const t = useTranslations('questions.picker.facet')
  const options: Array<{ value: QuestionStatusFilter; label: string }> = [
    { value: 'active', label: t('activeOnly') },
    { value: 'inactive', label: t('deletedOnly') },
    { value: 'all', label: t('statusActiveDeleted') },
  ]
  const activeCount = selected !== 'active' ? 1 : 0
  return (
    <FacetSection title={t('statusTitle')} activeCount={activeCount}>
      <Stack gap={1}>
        {options.map((option) => (
          <FacetRowButton
            key={option.value}
            label={option.label}
            state={selected === option.value ? 'selected' : 'default'}
            onClick={() => onChange(option.value)}
          />
        ))}
      </Stack>
    </FacetSection>
  )
}

function FacetSection(props: {
  title: string
  activeCount: number
  children: React.ReactNode
}) {
  const { title, activeCount, children } = props
  return (
    <DividedStackItem>
      <Stack gap={2}>
        <Inline gap={2} align="center" justify="between">
          <EyebrowLabel weight="bold">{title}</EyebrowLabel>
          {activeCount > 0 ? (
            <StatusPill tone="primary" size="compact">
              {activeCount}
            </StatusPill>
          ) : null}
        </Inline>
        {children}
      </Stack>
    </DividedStackItem>
  )
}
