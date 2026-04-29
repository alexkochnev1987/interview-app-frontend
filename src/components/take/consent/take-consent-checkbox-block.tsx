import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { TakePanel } from '@/components/take/take-panel';
import { Text } from '@/components/ui/text';

interface TakeConsentCheckboxBlockProps {
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
}

export function TakeConsentCheckboxBlock({
  consent,
  onConsentChange,
}: TakeConsentCheckboxBlockProps) {
  return (
    <TakePanel tone="white">
      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => onConsentChange(Boolean(checked))}
          className="mt-1"
        />
        <div className="space-y-2">
          <Label htmlFor="consent">
            <Text as="span" variant="labelSmStrong">
              I agree to the recording and data collection terms.
            </Text>
          </Label>
          <Text variant="bodyMutedSm">Data is used only for interview evaluation and is stored for 90 days.</Text>
        </div>
      </div>
    </TakePanel>
  );
}
