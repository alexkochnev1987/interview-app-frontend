import { CheckCircle2 } from 'lucide-react';

export function TakeSubmissionIconBox() {
  return (
    <div className="mx-auto flex size-16 items-center justify-center rounded-[1.4rem] bg-[hsl(var(--primary-fixed)/0.85)] text-[hsl(var(--primary))]">
      <CheckCircle2 className="size-8" />
    </div>
  );
}
