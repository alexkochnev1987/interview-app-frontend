'use client'

import { ChevronDown, ChevronRight, Globe, Lock, RotateCcw, SquarePen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import { ConfigBooleanToggle } from '@/components/config/config-feature-toggle'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { StatusPill } from '@/components/ui/status-pill'
import { TableCell, TableRow } from '@/components/ui/table'
import { BodyText } from '@/components/ui/text'
import type { SystemConfigEntry, SystemConfigValueType } from '@/lib/api'
import {
  RECRUITER_ASSISTANT_ENABLED_KEY,
  RECRUITER_ASSISTANT_ROLE_LOCKS,
} from '@/lib/app-config-types'

type ConfigTableRowProps = {
  entry: SystemConfigEntry
  renderValueTypeBadge: (valueType: SystemConfigValueType, value?: string) => ReactNode
  renderValue: (entry: SystemConfigEntry) => ReactNode
  onEdit: (entry: SystemConfigEntry) => void
  onReset: (key: string) => void
  keyLabel?: string
  nested?: boolean
  expandControl?: ReactNode
}

export function ConfigTableRow({
  entry,
  renderValueTypeBadge,
  renderValue,
  onEdit,
  onReset,
  keyLabel,
  nested = false,
  expandControl,
}: ConfigTableRowProps) {
  const t = useTranslations('config')

  return (
    <TableRow>
      <TableCell width="fill">
        <Inline gap={2} align="start">
          {expandControl}
          <Stack gap={1}>
            <BodyText tone="foreground" weight="semibold">
              {nested ? (
                <Inline gap={1.5} align="center">
                  <BodyText as="span" size="sm" tone="muted">
                    ↳
                  </BodyText>
                  {keyLabel ?? entry.key}
                </Inline>
              ) : (
                (keyLabel ?? entry.key)
              )}
            </BodyText>
            {entry.description ? (
              <BodyText size="xs" tone="muted">
                {entry.description}
              </BodyText>
            ) : null}
          </Stack>
        </Inline>
      </TableCell>

      <TableCell nowrap>
        <Inline gap={2} align="center">
          {renderValueTypeBadge(entry.valueType, entry.value)}
          {entry.isPublic ? (
            <StatusPill tone="completed" size="compact">
              <Icon size="xs">
                <Globe />
              </Icon>
              {t('table.publicBadge')}
            </StatusPill>
          ) : null}
          {entry.isSecret ? (
            <StatusPill tone="pending" size="compact">
              <Icon size="xs">
                <Lock />
              </Icon>
              {t('table.secretBadge')}
            </StatusPill>
          ) : null}
        </Inline>
      </TableCell>

      <TableCell nowrap>{renderValue(entry)}</TableCell>

      <TableCell align="right" nowrap>
        <Inline gap={2} justify="end">
          <DemoWriteGuard>
            <Button type="button" variant="outline-pill" size="xs" onClick={() => onEdit(entry)}>
              <Icon size="xs">
                <SquarePen />
              </Icon>
              {t('table.edit')}
            </Button>
          </DemoWriteGuard>

          <DemoWriteGuard disabled={entry.isOverridden === false}>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              disabled={entry.isOverridden === false}
              onClick={() => onReset(entry.key)}
            >
              <Icon size="xs">
                <RotateCcw />
              </Icon>
              {t('table.reset')}
            </Button>
          </DemoWriteGuard>
        </Inline>
      </TableCell>
    </TableRow>
  )
}

type RecruiterAssistantConfigGroupProps = {
  globalEntry: SystemConfigEntry
  configs: SystemConfigEntry[]
  expanded: boolean
  onToggleExpanded: () => void
  getBooleanValue: (key: string, fallback: boolean) => boolean
  roleLabel: (role: (typeof RECRUITER_ASSISTANT_ROLE_LOCKS)[number]['role']) => string
  onGlobalToggle: (enabled: boolean) => void
  onRoleToggle: (
    key: string,
    enabled: boolean,
    role: (typeof RECRUITER_ASSISTANT_ROLE_LOCKS)[number]['role'],
  ) => void
  renderValueTypeBadge: (valueType: SystemConfigValueType, value?: string) => React.ReactNode
  onEdit: (entry: SystemConfigEntry) => void
  onReset: (key: string) => void
}

export function RecruiterAssistantConfigGroup({
  globalEntry,
  configs,
  expanded,
  onToggleExpanded,
  getBooleanValue,
  roleLabel,
  onGlobalToggle,
  onRoleToggle,
  renderValueTypeBadge,
  onEdit,
  onReset,
}: RecruiterAssistantConfigGroupProps) {
  const t = useTranslations('config')

  const expandControl = (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-expanded={expanded}
      aria-label={expanded ? t('table.collapseRecruiterRoles') : t('table.expandRecruiterRoles')}
      onClick={onToggleExpanded}
    >
      {expanded ? <ChevronDown /> : <ChevronRight />}
    </Button>
  )

  function renderBooleanValue(
    entry: SystemConfigEntry,
    enabled: boolean,
    onEnable: () => void,
    onDisable: () => void,
  ) {
    return (
      <ConfigBooleanToggle
        ariaLabel={entry.key}
        enabled={enabled}
        enabledLabel={t('featureToggles.enabled')}
        disabledLabel={t('featureToggles.disabled')}
        onEnable={onEnable}
        onDisable={onDisable}
      />
    )
  }

  return (
    <>
      <ConfigTableRow
        entry={globalEntry}
        renderValueTypeBadge={renderValueTypeBadge}
        renderValue={() =>
          renderBooleanValue(
            globalEntry,
            getBooleanValue(RECRUITER_ASSISTANT_ENABLED_KEY, true),
            () => onGlobalToggle(true),
            () => onGlobalToggle(false),
          )
        }
        onEdit={onEdit}
        onReset={onReset}
        expandControl={expandControl}
      />
      {expanded
        ? RECRUITER_ASSISTANT_ROLE_LOCKS.map(({ role, key }) => {
            const entry =
              configs.find((item) => item.key === key) ??
              ({
                key,
                value: 'true',
                valueType: 'boolean',
                isPublic: false,
                isSecret: false,
                isOverridden: false,
                description: t('featureToggles.recruiterAssistantRoles.roleDescription', {
                  role: roleLabel(role),
                }),
              } satisfies SystemConfigEntry)

            return (
              <ConfigTableRow
                key={key}
                entry={entry}
                keyLabel={roleLabel(role)}
                nested
                renderValueTypeBadge={renderValueTypeBadge}
                renderValue={() =>
                  renderBooleanValue(
                    entry,
                    getBooleanValue(key, true),
                    () => onRoleToggle(key, true, role),
                    () => onRoleToggle(key, false, role),
                  )
                }
                onEdit={onEdit}
                onReset={onReset}
              />
            )
          })
        : null}
    </>
  )
}
