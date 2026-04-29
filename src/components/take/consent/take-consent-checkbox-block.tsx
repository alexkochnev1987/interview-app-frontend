import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { BodyMutedSm, LabelSmStrong } from '@/components/layout/content-presets';
import { TakePanel } from '@/components/take/take-panel';

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
            <LabelSmStrong>I agree to the recording and data collection terms.</LabelSmStrong>
          </Label>
          <BodyMutedSm>
            Data is used only for interview evaluation and is stored for 90 days.
          </BodyMutedSm>
        </div>
      </div>
    </TakePanel>
  );
}
