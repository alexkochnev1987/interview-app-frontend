import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface QuestionEditorSubmitBarProps {
  submitting: boolean;
  submitLabel: string;
}

export function QuestionEditorSubmitBar({ submitting, submitLabel }: QuestionEditorSubmitBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-white/65 bg-white/88 px-6 py-5 shadow-soft">
      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Saving preserves the current rubric state exactly as shown above. AI proposals are only
        persisted after you explicitly apply them.
      </p>
      <Button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-primary-gradient px-5 shadow-soft hover:brightness-105"
      >
        <Save className="size-4" />
        {submitting ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
