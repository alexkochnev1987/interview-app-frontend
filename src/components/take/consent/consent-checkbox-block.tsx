import { Checkbox } from '@/components/ui/checkbox';
import { Inline, Stack } from '@/components/ui/layout';
import { Label } from '@/components/ui/label';
import { Panel } from '@/components/ui/panel';
import { Text } from '@/components/ui/text';
import { useTranslations } from 'next-intl';

interface TakeConsentCheckboxBlockProps {
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
}

export function TakeConsentCheckboxBlock({
  consent,
  onConsentChange,
}: TakeConsentCheckboxBlockProps) {
  const tTake = useTranslations('takeFlow');
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
          <Text variant="bodyMutedSm">{tTake('consentCheckboxHint')}</Text>
        </Stack>
      </Inline>
    </Panel>
  );
}
