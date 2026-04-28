import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TakeConsentCheckboxBlockProps {
  consent: boolean;
  onConsentChange: (checked: boolean) => void;
}

export function TakeConsentCheckboxBlock({
  consent,
  onConsentChange,
}: TakeConsentCheckboxBlockProps) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] bg-white/85 p-4 ring-1 ring-border/45">
      <Checkbox
        id="consent"
        checked={consent}
        onCheckedChange={(checked) => onConsentChange(Boolean(checked))}
        className="mt-1"
      />
      <div className="space-y-2">
        <Label htmlFor="consent" className="text-sm font-semibold text-foreground">
          I agree to the recording and data collection terms.
        </Label>
        <p className="text-sm leading-6 text-muted-foreground">
          Data is used only for interview evaluation and is stored for 90 days.
        </p>
      </div>
    </div>
  );
}
