'use client'

import { Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { SurfaceTile } from '@/components/ui/surface-tile'
import { BodyText } from '@/components/ui/text'
import { formatFeedbackShareLinkPreview } from '@/lib/interview-detail-format'
import { formatInterviewDate } from '@/lib/interview-formatters'

type CopyStatus = 'idle' | 'copied' | 'error'

interface CandidateFeedbackSharePanelProps {
  shareUrl: string | null
  expiresAt: string | null
  hasActiveLink: boolean
  copyStatus: CopyStatus
  onCopy: () => void
}

export function CandidateFeedbackSharePanel({
  shareUrl,
  expiresAt,
  hasActiveLink,
  copyStatus,
  onCopy,
}: CandidateFeedbackSharePanelProps) {
  const t = useTranslations('interviews.candidateFeedback')

  if (!shareUrl && !expiresAt && !hasActiveLink) {
    return null
  }

  return (
    <SurfaceTile
      tone="glass"
      padding="lg"
      data-tour="candidate-feedback-share-link"
    >
      <Stack gap={3}>
        <Inline gap={3} align="center" justify="between" wrap="wrap">
          <BodyText as="span" size="sm-tight" tone="foreground">
            {t('shareLinkLabel')}
          </BodyText>
          {shareUrl ? (
            <Button
              type="button"
              variant="gradient"
              shape="pill"
              size="sm"
              onClick={onCopy}
            >
              <Icon size="md">
                <Copy />
              </Icon>
              {copyStatus === 'copied'
                ? t('shareLinkCopied')
                : copyStatus === 'error'
                  ? t('shareLinkCopyFailed')
                  : t('copyShareLink')}
            </Button>
          ) : null}
        </Inline>

        {shareUrl ? (
          <Stack gap={1}>
            <BodyText size="sm" title={shareUrl}>
              {formatFeedbackShareLinkPreview(shareUrl)}
            </BodyText>
            <BodyText size="xs">{t('shareLinkPreviewHelp')}</BodyText>
          </Stack>
        ) : (
          <BodyText size="sm">{t('shareLinkActive')}</BodyText>
        )}

        {expiresAt ? (
          <BodyText size="sm">
            {t('shareLinkExpires', {
              date: formatInterviewDate(expiresAt),
            })}
          </BodyText>
        ) : null}
      </Stack>
    </SurfaceTile>
  )
}
