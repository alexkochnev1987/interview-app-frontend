import type { Question } from '@/lib/api';

interface SelectedPacketPreviewProps {
  selectedQuestions: Question[];
}

export function SelectedPacketPreview({ selectedQuestions }: SelectedPacketPreviewProps) {
  if (selectedQuestions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45">
      <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        Current packet
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {selectedQuestions.map((question) => question.questionText).join(' · ')}
      </p>
    </div>
  );
}
