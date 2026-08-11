'use client'

import { Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { Button } from '@/components/ui/button'
import { CardDescription, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { useRouter } from '@/i18n/navigation'
import { routes } from '@/i18n/routes'

export function TemplatesListHeader() {
  const t = useTranslations('templates')
  const router = useRouter()

  return (
    <Inline justify="between" align="center" gap={4}>
      <Stack gap={1}>
        <CardTitle size="xl">{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </Stack>
      <DemoWriteGuard>
        <Button variant="gradient" onClick={() => router.push(routes.templates.new)}>
          <Icon size="md">
            <Plus />
          </Icon>
          {t('newButton')}
        </Button>
      </DemoWriteGuard>
    </Inline>
  )
}
