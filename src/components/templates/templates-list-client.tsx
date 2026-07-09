'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { ArrowRight, LayoutTemplate, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'

import { templatesListQueryKey } from '@/components/templates/query-keys'
import { useDeleteTemplate } from '@/components/templates/use-template-mutations'
import { getTemplates, type Template } from '@/lib/api'
import { routes } from '@/i18n/routes'
import { useRouter } from '@/i18n/navigation'
import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CardGrid } from '@/components/ui/layout/card-grid'
import { Grid } from '@/components/ui/layout/grid'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Inline } from '@/components/ui/layout/inline'
import { MetricPanel } from '@/components/ui/metric-panel'
import { SearchInput } from '@/components/ui/search-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusPill } from '@/components/ui/status-pill'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

type TemplateSort = 'popular' | 'recent' | 'name'

interface TemplateGroup {
  key: string
  header: string
  templates: Template[]
}

const updatedMs = (t: Template) => new Date(t.updatedAt).getTime()

// Comparator for templates within a group, driven by the active sort.
function cardComparator(sort: TemplateSort): (a: Template, b: Template) => number {
  if (sort === 'recent') {
    return (a, b) => updatedMs(b) - updatedMs(a) || a.name.localeCompare(b.name)
  }
  if (sort === 'name') {
    return (a, b) => a.name.localeCompare(b.name)
  }
  return (a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name)
}

function matchesSearch(template: Template, needle: string): boolean {
  if (!needle) return true
  const hay = `${template.name} ${template.description ?? ''} ${template.position ?? ''}`
  return hay.toLowerCase().includes(needle)
}

// Group by position; group order follows the active sort, with "Other" always last.
function groupByPosition(
  templates: Template[],
  otherLabel: string,
  sort: TemplateSort,
): TemplateGroup[] {
  const groups = new Map<string, TemplateGroup>()
  for (const template of templates) {
    const header = template.position?.trim() || otherLabel
    const key = header.toLowerCase()
    const group = groups.get(key) ?? { key, header, templates: [] }
    group.templates.push(template)
    groups.set(key, group)
  }
  const isOther = (g: TemplateGroup) => g.header === otherLabel
  const rank = (g: TemplateGroup) => {
    if (sort === 'recent') return Math.max(...g.templates.map(updatedMs))
    if (sort === 'name') return 0
    return g.templates.reduce((sum, t) => sum + t.usageCount, 0)
  }
  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      templates: [...group.templates].sort(cardComparator(sort)),
    }))
    .sort((a, b) => {
      if (isOther(a) !== isOther(b)) return isOther(a) ? 1 : -1
      if (sort === 'name') return a.header.localeCompare(b.header)
      return rank(b) - rank(a) || a.header.localeCompare(b.header)
    })
}

export function TemplatesListClient() {
  const t = useTranslations('templates')
  const format = useFormatter()
  const locale = useLocale()
  const router = useRouter()
  const deleteTemplate = useDeleteTemplate()
  const [pendingDelete, setPendingDelete] = useState<Template | null>(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<TemplateSort>('popular')

  const { data: templates = [], isLoading, isError, refetch } = useQuery({
    queryKey: templatesListQueryKey(locale),
    queryFn: getTemplates,
  })

  const groups = useMemo(() => {
    const needle = search.trim().toLowerCase()
    const filtered = templates.filter((template) => matchesSearch(template, needle))
    return groupByPosition(filtered, t('list.otherGroup'), sort)
  }, [templates, t, search, sort])

  function confirmDelete() {
    if (!pendingDelete) return
    deleteTemplate.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    })
  }

  return (
    <Stack gap={6}>
      <Inline justify="between" align="center" gap={4}>
        <Stack gap={1}>
          <CardTitle size="xl">{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </Stack>
        <DemoWriteGuard>
          <Button variant="gradient" onClick={() => router.push(routes.templates.new)}>
            <Icon size="md"><Plus /></Icon>
            {t('newButton')}
          </Button>
        </DemoWriteGuard>
      </Inline>

      {isError ? (
        <Alert variant="danger">
          <AlertTitle>{t('list.loadError')}</AlertTitle>
          <AlertDescription>
            <Button variant="outline" onClick={() => refetch()}>
              <Icon size="md"><RefreshCw /></Icon>
              {t('list.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      {isLoading ? (
        <BodyText tone="muted">{t('list.loading')}</BodyText>
      ) : templates.length === 0 ? (
        <Card variant="surface">
          <CardHeader spacing="sm">
            <IconBadge tone="surface" size="md">
              <Icon size="lg"><LayoutTemplate /></Icon>
            </IconBadge>
            <CardTitle size="lg">{t('empty.title')}</CardTitle>
            <CardDescription>{t('empty.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <DemoWriteGuard>
              <Button variant="gradient" onClick={() => router.push(routes.templates.new)}>
                <Icon size="md"><Plus /></Icon>
                {t('empty.cta')}
              </Button>
            </DemoWriteGuard>
          </CardContent>
        </Card>
      ) : (
        <Stack gap={6}>
          <Inline justify="between" align="center" gap={3} wrap="wrap">
            <Inline grow="fill">
              <SearchInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('toolbar.searchPlaceholder')}
              />
            </Inline>
            <Inline gap={2} align="center">
              <BodyText size="sm" tone="muted">{t('toolbar.sortLabel')}</BodyText>
              <Select value={sort} onValueChange={(value) => setSort(value as TemplateSort)}>
                <SelectTrigger variant="surface" size="md" shape="rounded">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">{t('toolbar.sortPopular')}</SelectItem>
                  <SelectItem value="recent">{t('toolbar.sortRecent')}</SelectItem>
                  <SelectItem value="name">{t('toolbar.sortName')}</SelectItem>
                </SelectContent>
              </Select>
            </Inline>
          </Inline>

          {groups.length === 0 ? (
            <BodyText tone="muted">{t('list.noResults')}</BodyText>
          ) : null}

          {groups.map((group) => (
            <Stack key={group.key} gap={4}>
              <Inline gap={3} align="center">
                <CardTitle size="lg">{group.header}</CardTitle>
                <StatusPill tone="neutral">
                  {t('list.groupCount', { count: group.templates.length })}
                </StatusPill>
              </Inline>
              <CardGrid>
                {group.templates.map((template) => (
                  <Card key={template.id} variant="surface" height="full">
                    <CardHeader spacing="md">
                      <Stack gap={1.5}>
                        <CardTitle size="list">{template.name}</CardTitle>
                        {template.description ? (
                          <CardDescription>{template.description}</CardDescription>
                        ) : null}
                      </Stack>
                    </CardHeader>
                    <CardContent spacing="md">
                      <Grid columns={2} gap={3}>
                        <MetricPanel
                          tone="compact"
                          label={t('list.questionsLabel')}
                          value={template.questionCount}
                          valueSize="md"
                        />
                        <MetricPanel
                          tone="compact"
                          label={t('list.popularityLabel')}
                          value={template.usageCount}
                          valueSize="md"
                        />
                      </Grid>

                      <BodyText size="sm" tone="muted">
                        {t('list.updatedLabel')}:{' '}
                        {format.dateTime(new Date(template.updatedAt), {
                          dateStyle: 'medium',
                        })}
                      </BodyText>

                      <Inline gap={2} wrap="wrap">
                        <DemoWriteGuard>
                          <Button
                            variant="default"
                            onClick={() =>
                              router.push(routes.interviews.newFromTemplate(template.id))
                            }
                          >
                            {t('list.useButton')}
                            <Icon size="md"><ArrowRight /></Icon>
                          </Button>
                        </DemoWriteGuard>
                        <DemoWriteGuard>
                          <Button
                            variant="outline"
                            onClick={() => router.push(routes.templates.detail(template.id))}
                          >
                            <Icon size="md"><Pencil /></Icon>
                            {t('list.editButton')}
                          </Button>
                        </DemoWriteGuard>
                        <DemoWriteGuard>
                          <Button
                            variant="outline"
                            onClick={() => setPendingDelete(template)}
                          >
                            <Icon size="md"><Trash2 /></Icon>
                            {t('list.deleteButton')}
                          </Button>
                        </DemoWriteGuard>
                      </Inline>
                    </CardContent>
                  </Card>
                ))}
              </CardGrid>
            </Stack>
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        destructive
        title={t('delete.confirmTitle', { name: pendingDelete?.name ?? '' })}
        description={t('delete.confirmDescription')}
        confirmLabel={t('delete.confirmButton')}
        cancelLabel={t('delete.cancelButton')}
        loading={deleteTemplate.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  )
}
