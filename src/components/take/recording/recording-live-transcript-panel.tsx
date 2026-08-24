'use client'

import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { TakeStage } from '@/components/take/types'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Panel } from '@/components/ui/panel'
import { Text } from '@/components/ui/text'
import { useAppConfig } from '@/lib/app-config-context'

interface LiveTranscriptPanelProps {
  isSupported: boolean
  finalTranscript: string
  interimTranscript: string
  warning?: string
  stage: TakeStage
}

export function LiveTranscriptPanel({
  isSupported,
  finalTranscript,
  interimTranscript,
  warning,
}: LiveTranscriptPanelProps) {
  const tTake = useTranslations('takeFlow')
  const { ENABLE_LIVE_TRANSCRIPT, LIVE_TRANSCRIPT_DEFAULT_EXPANDED } = useAppConfig()
  const [isExpanded, setIsExpanded] = useState(LIVE_TRANSCRIPT_DEFAULT_EXPANDED)

  if (!ENABLE_LIVE_TRANSCRIPT) {
    return null
  }

  return (
    <Panel minHeight={isExpanded ? 'transcript' : 'none'}>
      <Stack gap={2} grow={isExpanded ? 'fill' : 'none'} height={isExpanded ? 'full' : 'auto'}>
        <Inline justify="between" align="center">
          <Text as="span" variant="eyebrowLabel">
            {tTake('liveTranscriptTitle')}
          </Text>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={
              isExpanded ? tTake('liveTranscriptCollapse') : tTake('liveTranscriptExpand')
            }
          >
            <Icon size="xs">{isExpanded ? <ChevronUp /> : <ChevronDown />}</Icon>
          </Button>
        </Inline>

        {isExpanded ? (
          <Stack gap={2} grow="fill" overflow="y">
            {!isSupported ? (
              <Text variant="bodyMutedSm">{tTake('liveTranscriptUnavailable')}</Text>
            ) : (
              <Text variant="bodySm">
                {finalTranscript || interimTranscript ? (
                  <>
                    {finalTranscript}
                    {interimTranscript ? (
                      <Text as="span" variant="transcriptDraft">
                        {interimTranscript} {tTake('liveTranscriptDraftSuffix')}
                      </Text>
                    ) : null}
                  </>
                ) : (
                  tTake('liveTranscriptPlaceholder')
                )}
              </Text>
            )}
            {warning ? <Text variant="captionWarningXs">{warning}</Text> : null}
          </Stack>
        ) : null}
      </Stack>
    </Panel>
  )
}
