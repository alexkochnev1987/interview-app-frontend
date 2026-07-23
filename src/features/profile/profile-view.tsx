'use client'

import { LockKeyhole, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { DemoWriteGuard } from '@/components/demo/demo-write-guard'
import { TeamRoleBadge } from '@/components/team/team-role-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeroTitle } from '@/components/ui/hero-text'
import { Icon } from '@/components/ui/icon'
import { IconBadge } from '@/components/ui/icon-badge'
import { Grid } from '@/components/ui/layout/grid'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText, SectionHeading } from '@/components/ui/text'
import type { MeResponse } from '@/lib/api'
import { getCandidateInitials } from '@/lib/interview-formatters'

import { ProfileField } from './profile-field'

interface ProfileViewProps {
  user: MeResponse
  mode?: 'self' | 'member'
}

export function ProfileView({ user, mode = 'self' }: ProfileViewProps) {
  const t = useTranslations('profile')
  const isSelf = mode === 'self'

  const personalInformationCard = (
    <Card variant="surface">
      <CardHeader spacing="xs">
        <CardTitle size="lg">{t('personalInformation.title')}</CardTitle>
      </CardHeader>
      <CardContent spacing="lg">
        <Stack gap={5}>
          <ProfileField
            label={t('personalInformation.name')}
            value={user.name}
            action={
              isSelf ? (
                <DemoWriteGuard>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled
                    aria-label={t('summary.editProfile')}
                  >
                    <Icon size="sm">
                      <Pencil />
                    </Icon>
                  </Button>
                </DemoWriteGuard>
              ) : undefined
            }
          />
          <ProfileField
            label={t('personalInformation.email')}
            value={user.email}
          />
          <ProfileField
            label={t('personalInformation.role')}
            value={<TeamRoleBadge role={user.role} />}
          />
          <ProfileField
            label={t('personalInformation.organizationId')}
            value={
              user.organizationId ?? t('personalInformation.organizationUnassigned')
            }
          />
        </Stack>
      </CardContent>
    </Card>
  )

  const securityCard = (
    <Card variant="surface">
      <CardHeader spacing="xs">
        <CardTitle size="lg">{t('security.title')}</CardTitle>
      </CardHeader>
      <CardContent spacing="lg">
        <Inline justify="between" align="center" wrap="wrap" width="full">
          <Inline gap={3} align="center">
            <Icon size="md">
              <LockKeyhole />
            </Icon>
            <BodyText weight="medium">{t('security.changePassword')}</BodyText>
          </Inline>
          <DemoWriteGuard>
            <Button type="button" variant="outline" disabled>
              {t('security.changePassword')}
            </Button>
          </DemoWriteGuard>
        </Inline>
      </CardContent>
    </Card>
  )

  return (
    <Stack gap={8} width="full">
      <Stack gap={2} width="full">
        <SectionHeading size="xl">
          {isSelf ? t('heading') : t('memberHeading')}
        </SectionHeading>
        <BodyText as="p" size="responsive-sm" width="prose">
          {isSelf ? t('lead') : t('memberLead')}
        </BodyText>
      </Stack>

      <Card variant="floating" size="lg">
        <CardContent spacing="xl">
          {isSelf ? (
            <Grid columns="page-header-actions" align="center">
              <Inline gap={4} align="center">
                <IconBadge tone="surface" size="xl" shape="circle" textSize="lg">
                  {getCandidateInitials(user.name)}
                </IconBadge>
                <HeroTitle>{user.name}</HeroTitle>
              </Inline>
              <DemoWriteGuard>
                <Button type="button" variant="gradient" disabled>
                  {t('summary.editProfile')}
                </Button>
              </DemoWriteGuard>
            </Grid>
          ) : (
            <Inline gap={4} align="center">
              <IconBadge tone="surface" size="xl" shape="circle" textSize="lg">
                {getCandidateInitials(user.name)}
              </IconBadge>
              <HeroTitle>{user.name}</HeroTitle>
            </Inline>
          )}
        </CardContent>
      </Card>

      {isSelf ? (
        <Grid columns="split-12-8" gap={6}>
          {personalInformationCard}
          {securityCard}
        </Grid>
      ) : (
        personalInformationCard
      )}
    </Stack>
  )
}
