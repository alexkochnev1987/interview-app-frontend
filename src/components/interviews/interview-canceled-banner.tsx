'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Stack } from '@/components/ui/layout/stack'
import { BodyText } from '@/components/ui/text'

export function InterviewCanceledBanner() {
    const t = useTranslations('interviews.canceledBanner')

    return (
        <Card variant="warning" size="sm" role="alert" >
            <Stack gap={1}>
                <BodyText size="sm" tone="foreground" weight="medium">
                    {t('title')}
                </BodyText>
                <BodyText size="sm" tone="foreground">
                    {t('description')}
                </BodyText>
            </Stack>
        </Card>
    )
}