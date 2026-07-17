'use client'

import { RotateCcw } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FacetRowButton } from '@/components/ui/facet-row-button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { DividedStack, DividedStackItem } from '@/components/ui/layout/divided-stack'
import { Stack } from '@/components/ui/layout/stack'
import { ShowMoreToggle } from '@/components/ui/show-more-toggle'
import { StatusPill } from '@/components/ui/status-pill'
import { BodyText } from '@/components/ui/text'
import { useSharedLabels } from '@/i18n/use-shared-labels'
import type { InterviewFacetCount, InterviewStatusFilter } from '@/lib/api'

import { AssignedHrSelect } from '../assigned-hr-select'

const COLLAPSED_LIMIT = 6

export type InterviewFacetSidebarProps = {
  positions: InterviewFacetCount[]
  statuses: InterviewFacetCount[]
  selected: {
    position?: string
    status?: InterviewStatusFilter
    assignedHrId?: string
  }
  onPositionChange: (value: string | undefined) => void
  onStatusChange: (value: InterviewStatusFilter | undefined) => void
  onAssignedHrIdChange: (value: string | undefined) => void
  showAssignedHrFilter: boolean
  onReset: () => void
  canReset: boolean
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function InterviewFacetSidebar(props: InterviewFacetSidebarProps) {
  const {
    positions,
    statuses,
    selected,
    onPositionChange,
    onStatusChange,
    onAssignedHrIdChange,
    showAssignedHrFilter,
    onReset,
    canReset,
    loading,
    error,
    onRetry,
  } = props
  const t = useTranslations('interviews.library.facet')

  const activeFilterCount =
    (selected.position ? 1 : 0) +
    (selected.status ? 1 : 0) +
    (selected.assignedHrId ? 1 : 0)

  return (
    <Card variant="surface" size="sm">
      <CardContent spacing="md">
        <Stack gap={3}>
          <Inline gap={2} align="center" justify="between">
            <BodyText as="span" size="base" tone="foreground" weight="semibold">
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
            <Icon size="md">
              <RotateCcw />
            </Icon>
            {activeFilterCount > 0
              ? t('resetAllWithCount', { count: activeFilterCount })
              : t('resetAll')}
          </Button>

          {error ? (
            <Stack gap={2}>
              <BodyText size="sm" weight="semibold">
                {t('unavailable')}
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
          {showAssignedHrFilter ? (
            <AssignedHrFacetSection
              selected={selected.assignedHrId}
              onChange={onAssignedHrIdChange}
            />
          ) : null}
          <StatusFacetSection
            values={statuses}
            selected={selected.status}
            onChange={onStatusChange}
            loading={loading && statuses.length === 0}
          />
          <PositionFacetSection
            values={positions}
            selected={selected.position}
            onChange={onPositionChange}
            loading={loading && positions.length === 0}
          />
        </DividedStack>
      </CardContent>
    </Card>
  )
}

function AssignedHrFacetSection(props: {
  selected: string | undefined
  onChange: (value: string | undefined) => void
}) {
  const { selected, onChange } = props
  const t = useTranslations('interviews.library.facet')
  const activeCount = selected ? 1 : 0

  return (
    <FacetSection title={t('hrTitle')} activeCount={activeCount}>
      <AssignedHrSelect
        id="interview-filter-assignedHr"
        mode="filter"
        value={selected}
        onValueChange={onChange}
        allowUnassigned
        clearOptionLabel={t('hrFilterAll')}
        unassignedOnlyLabel={t('hrFilterUnassigned')}
        enabled
      />
    </FacetSection>
  )
}

function PositionFacetSection(props: {
  values: InterviewFacetCount[]
  selected: string | undefined
  onChange: (value: string | undefined) => void
  loading: boolean
}) {
  const { values, selected, onChange, loading } = props
  const t = useTranslations('interviews.library.facet')
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? values : values.slice(0, COLLAPSED_LIMIT)
  const hidden = Math.max(0, values.length - visible.length)
  const activeCount = selected ? 1 : 0

  return (
    <FacetSection title={t('positionTitle')} activeCount={activeCount}>
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

function StatusFacetSection(props: {
  values: InterviewFacetCount[]
  selected: InterviewStatusFilter | undefined
  onChange: (value: InterviewStatusFilter | undefined) => void
  loading: boolean
}) {
  const { values, selected, onChange, loading } = props
  const t = useTranslations('interviews.library.facet')
  const sharedLabels = useSharedLabels()
  const activeCount = selected ? 1 : 0

  return (
    <FacetSection title={t('statusTitle')} activeCount={activeCount}>
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
          {values.map((item) => {
            const status = item.value as InterviewStatusFilter
            const isSelected = selected === status
            return (
              <FacetRowButton
                key={item.value}
                label={sharedLabels.interviewStatus(status)}
                trailing={item.count}
                state={isSelected ? 'selected' : 'default'}
                onClick={() => onChange(isSelected ? undefined : status)}
              />
            )
          })}
        </Stack>
      )}
    </FacetSection>
  )
}

function FacetSection(props: {
  title: string
  activeCount: number
  children: ReactNode
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
