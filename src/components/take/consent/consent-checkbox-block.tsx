import { useTranslations } from 'next-intl'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { Panel } from '@/components/ui/panel'
import { Text } from '@/components/ui/text'

interface TakeConsentCheckboxBlockProps {
  consent: boolean
  onConsentChange: (checked: boolean) => void
  hintOverride?: string
}

export function TakeConsentCheckboxBlock({
  consent,
  onConsentChange,
  hintOverride,
}: TakeConsentCheckboxBlockProps) {
  const tTake = useTranslations('takeFlow')
  return (
    <Panel radius="lg" padding="lg">
      <Inline align="start" gap={3}>
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => onConsentChange(Boolean(checked))}
          align="top"
        />
        <Stack gap={2}>
          <Label htmlFor="consent">
            <Text as="span" variant="labelSmStrong">
              {tTake('consentCheckboxLabel')}
            </Text>
          </Label>
          <Text variant="bodyMutedSm">{hintOverride ?? tTake('consentCheckboxHint')}</Text>
        </Stack>
      </Inline>
    </Panel>
  )
}
