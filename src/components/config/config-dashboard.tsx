'use client'

import { Globe, Lock, Plus, RotateCcw, Search, SquarePen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTableSurface } from '@/components/ui/data-table-surface'
import { EyebrowBadge } from '@/components/ui/eyebrow-badge'
import { EyebrowLabel } from '@/components/ui/eyebrow-label'
import { FormField } from '@/components/ui/form-field'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Inline } from '@/components/ui/layout/inline'
import { PageShell } from '@/components/ui/layout/page-shell'
import { Section } from '@/components/ui/layout/section'
import { Stack } from '@/components/ui/layout/stack'
import { ModalShell } from '@/components/ui/modal-shell'
import { SearchInput } from '@/components/ui/search-input'
import { SegmentedGroup } from '@/components/ui/segmented-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SortableTableHead } from '@/components/ui/sortable-table-head'
import { EmptyStateCard } from '@/components/ui/state-card'
import { StatusPill } from '@/components/ui/status-pill'
import { TableHeader, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'
import { BodyText, SectionHeading } from '@/components/ui/text'
import { Textarea } from '@/components/ui/textarea'
import { useTableSort } from '@/components/ui/use-table-sort'
import {
  deleteSystemConfig,
  getSystemConfigs,
  updateSystemConfig,
  type SystemConfigEntry,
  type SystemConfigValueType,
} from '@/lib/api'
import { useRefreshAppConfig } from '@/lib/app-config-context'
import { runMutation } from '@/lib/run-mutation'

type ConfigSortField = 'key' | 'valueType' | 'value'

interface ConfigDashboardProps {
  initialConfigs: SystemConfigEntry[]
}

function renderValueTypeBadge(valueType: SystemConfigValueType, value?: string) {
  const displayType =
    valueType === 'boolean' || value === 'true' || value === 'false' ? 'boolean' : valueType
  switch (displayType) {
    case 'boolean':
    case 'enum':
      return (
        <EyebrowBadge tone="primary" size="sm">
          {displayType}
        </EyebrowBadge>
      )
    case 'number':
      return (
        <EyebrowBadge tone="default" size="sm">
          {displayType}
        </EyebrowBadge>
      )
    case 'secret':
      return (
        <EyebrowBadge tone="muted" size="sm">
          {displayType}
        </EyebrowBadge>
      )
    default:
      return (
        <EyebrowBadge tone="muted" size="sm">
          {displayType}
        </EyebrowBadge>
      )
  }
}

export function ConfigDashboard({ initialConfigs }: ConfigDashboardProps) {
  const t = useTranslations('config')
  const refreshPublicConfig = useRefreshAppConfig()

  const [configs, setConfigs] = useState<SystemConfigEntry[]>(initialConfigs)
  const [search, setSearch] = useState('')
  const [editingEntry, setEditingEntry] = useState<SystemConfigEntry | null>(null)
  const [editValue, setEditValue] = useState('')
  const [resetTargetKey, setResetTargetKey] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const [sortBy, setSortBy] = useState<ConfigSortField>('key')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { handleSortClick, directionFor } = useTableSort<ConfigSortField>({
    sortBy,
    sortOrder,
    onSortChange: (nextSortBy, nextSortOrder) => {
      setSortBy(nextSortBy)
      setSortOrder(nextSortOrder)
    },
    ascByDefault: ['key', 'valueType', 'value'],
  })

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newValueType] = useState<SystemConfigValueType>('string')
  const [newIsPublic, setNewIsPublic] = useState(false)
  const [newIsSecret, setNewIsSecret] = useState(false)
  const [newDescription, setNewDescription] = useState('')

  const filteredConfigs = configs
    .filter(
      (item) =>
        item.key.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase())),
    )
    .toSorted((a, b) => {
      let comparison = 0
      if (sortBy === 'key') {
        comparison = a.key.localeCompare(b.key)
      } else if (sortBy === 'valueType') {
        comparison = a.valueType.localeCompare(b.valueType)
      } else if (sortBy === 'value') {
        comparison = a.value.localeCompare(b.value)
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  async function reloadConfigs() {
    try {
      const fresh = await getSystemConfigs()
      setConfigs(fresh)
    } catch {}
  }

  function handleOpenEdit(entry: SystemConfigEntry) {
    setEditingEntry(entry)
    setEditValue(entry.isSecret ? '' : entry.value)
  }

  async function handleSaveEdit() {
    if (!editingEntry) return
    if (editingEntry.isSecret && editValue.trim() === '') return

    await runMutation(
      async () => {
        const updated = await updateSystemConfig(editingEntry.key, {
          value: editValue,
          valueType: editingEntry.valueType,
          options: editingEntry.options,
          description: editingEntry.description,
          isPublic: editingEntry.isPublic,
          isSecret: editingEntry.isSecret,
        })
        setEditingEntry(null)
        await reloadConfigs()
        await refreshPublicConfig()
        return updated
      },
      {
        successMessage: t('toast.updatedSuccess'),
        errorMessage: t('toast.updatedError'),
      },
    )
  }

  async function handleConfirmReset() {
    if (!resetTargetKey) return

    const keyToReset = resetTargetKey
    await runMutation(
      async () => {
        await deleteSystemConfig(keyToReset)
        setResetTargetKey(null)
        await reloadConfigs()
        await refreshPublicConfig()
      },
      {
        successMessage: t('toast.resetSuccess'),
        errorMessage: t('toast.resetError'),
      },
    )
  }

  async function handleCreateVariable() {
    const formattedKey = newKey.trim().toUpperCase()
    if (!formattedKey) return

    const isBool = newValue === 'true' || newValue === 'false'
    const resolvedType: SystemConfigValueType = newIsSecret
      ? 'secret'
      : isBool
        ? 'boolean'
        : newValueType

    await runMutation(
      async () => {
        const updated = await updateSystemConfig(formattedKey, {
          value: newValue,
          valueType: resolvedType,
          description: newDescription || undefined,
          isPublic: newIsPublic,
          isSecret: newIsSecret,
        })
        setShowAddModal(false)
        setNewKey('')
        setNewValue('')
        setNewDescription('')
        await reloadConfigs()
        await refreshPublicConfig()
        return updated
      },
      {
        successMessage: t('toast.createdSuccess'),
        errorMessage: t('toast.createdError'),
      },
    )
  }

  return (
    <PageShell>
      <Section>
        <Stack gap={6}>
          <Stack gap={2}>
            <EyebrowLabel>{t('eyebrow')}</EyebrowLabel>
            <SectionHeading>{t('title')}</SectionHeading>
            <BodyText tone="muted">{t('lead')}</BodyText>
          </Stack>

          <Inline gap={3} align="center" justify="between" wrap="wrap">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
            />

            <DemoWriteGuard>
              <Button
                type="button"
                variant="gradient"
                shape="pill"
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                <Icon size="sm">
                  <Plus />
                </Icon>
                {t('quickAdd')}
              </Button>
            </DemoWriteGuard>
          </Inline>

          <DataTableSurface hasItems={filteredConfigs.length > 0} minRows={5}>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  width="fill"
                  label={t('table.colKey')}
                  direction={directionFor('key')}
                  onSortClick={() => handleSortClick('key')}
                />
                <SortableTableHead
                  label={t('table.colType')}
                  direction={directionFor('valueType')}
                  onSortClick={() => handleSortClick('valueType')}
                />
                <SortableTableHead
                  label={t('table.colValue')}
                  direction={directionFor('value')}
                  onSortClick={() => handleSortClick('value')}
                />
                <TableHead align="right">{t('table.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyStateCard
                      icon={
                        <Icon size="lg">
                          <Search />
                        </Icon>
                      }
                      title={t('table.noResultsTitle')}
                      description={t('table.noResultsDesc')}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredConfigs.map((entry) => (
                  <TableRow key={entry.key}>
                    <TableCell width="fill">
                      <Stack gap={1}>
                        <BodyText tone="foreground" weight="semibold">
                          {entry.key}
                        </BodyText>
                        {entry.description ? (
                          <BodyText size="xs" tone="muted">
                            {entry.description}
                          </BodyText>
                        ) : null}
                      </Stack>
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

                    <TableCell nowrap>
                      <BodyText size="sm">
                        {entry.isSecret ? t('table.maskedSecret') : entry.value}
                      </BodyText>
                    </TableCell>

                    <TableCell align="right" nowrap>
                      <Inline gap={2} justify="end">
                        <DemoWriteGuard>
                          <Button
                            type="button"
                            variant="outline-pill"
                            size="xs"
                            onClick={() => handleOpenEdit(entry)}
                          >
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
                            onClick={() => setResetTargetKey(entry.key)}
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
                ))
              )}
            </TableBody>
          </DataTableSurface>
        </Stack>
      </Section>
      {editingEntry ? (
        <ModalShell
          accessibilityTitle={t('editModal.title')}
          onDismiss={() => setEditingEntry(null)}
        >
          <CardHeader>
            <CardTitle>{t('editModal.title')}</CardTitle>
            <BodyText size="sm" tone="muted">
              {t('editModal.description', { key: editingEntry.key })}
            </BodyText>
          </CardHeader>

          <CardContent>
            <Stack gap={4}>
              <FormField label={t('editModal.valueLabel')}>
                {editingEntry.options && editingEntry.options.length > 0 ? (
                  <Select value={editValue} onValueChange={setEditValue}>
                    <SelectTrigger width="full">
                      <SelectValue placeholder="Select option..." />
                    </SelectTrigger>
                    <SelectContent>
                      {editingEntry.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : editingEntry.valueType === 'boolean' ||
                  editingEntry.value === 'true' ||
                  editingEntry.value === 'false' ? (
                  <SegmentedGroup ariaLabel={t('editModal.valueLabel')}>
                    <Button
                      type="button"
                      variant={editValue === 'true' ? 'secondary' : 'ghost'}
                      shape="pill"
                      size="sm"
                      onClick={() => setEditValue('true')}
                    >
                      true
                    </Button>
                    <Button
                      type="button"
                      variant={editValue === 'false' ? 'secondary' : 'ghost'}
                      shape="pill"
                      size="sm"
                      onClick={() => setEditValue('false')}
                    >
                      false
                    </Button>
                  </SegmentedGroup>
                ) : editingEntry.valueType === 'json' ? (
                  <Textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={6}
                  />
                ) : (
                  <Input
                    type={editingEntry.isSecret ? 'password' : 'text'}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                )}
              </FormField>

              <Inline gap={2} justify="end" width="full">
                <Button type="button" variant="ghost" onClick={() => setEditingEntry(null)}>
                  {t('editModal.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  disabled={editingEntry.isSecret && editValue.trim() === ''}
                  onClick={() => void handleSaveEdit()}
                >
                  {t('editModal.save')}
                </Button>
              </Inline>
            </Stack>
          </CardContent>
        </ModalShell>
      ) : null}

      {showAddModal ? (
        <ModalShell
          accessibilityTitle={t('addModal.title')}
          onDismiss={() => setShowAddModal(false)}
        >
          <CardHeader>
            <CardTitle>{t('addModal.title')}</CardTitle>
            <BodyText size="sm" tone="muted">
              {t('addModal.description')}
            </BodyText>
          </CardHeader>

          <CardContent>
            <Stack gap={4}>
              <FormField label={t('addModal.keyLabel')}>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                  placeholder="MY_FEATURE_FLAG"
                />
              </FormField>

              <FormField label={t('addModal.valueLabel')}>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="true"
                />
              </FormField>

              <Inline gap={4} align="center">
                <Inline gap={2} align="center">
                  <Checkbox
                    id="newIsPublic"
                    checked={newIsPublic}
                    onCheckedChange={(c) => setNewIsPublic(c === true)}
                  />
                  <BodyText as="span" size="xs">
                    {t('addModal.isPublicLabel')}
                  </BodyText>
                </Inline>

                <Inline gap={2} align="center">
                  <Checkbox
                    id="newIsSecret"
                    checked={newIsSecret}
                    onCheckedChange={(c) => setNewIsSecret(c === true)}
                  />
                  <BodyText as="span" size="xs">
                    {t('addModal.isSecretLabel')}
                  </BodyText>
                </Inline>
              </Inline>

              <Inline gap={2} justify="end" width="full">
                <Button type="button" variant="ghost" onClick={() => setShowAddModal(false)}>
                  {t('addModal.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="gradient"
                  disabled={!newKey.trim()}
                  onClick={() => void handleCreateVariable()}
                >
                  {t('addModal.create')}
                </Button>
              </Inline>
            </Stack>
          </CardContent>
        </ModalShell>
      ) : null}

      <ConfirmDialog
        open={resetTargetKey !== null}
        title={t('resetModal.title')}
        description={
          resetTargetKey ? t('resetModal.description', { key: resetTargetKey }) : undefined
        }
        confirmLabel={t('resetModal.confirm')}
        cancelLabel={t('resetModal.cancel')}
        destructive
        onConfirm={() => void handleConfirmReset()}
        onCancel={() => setResetTargetKey(null)}
      />
    </PageShell>
  )
}
