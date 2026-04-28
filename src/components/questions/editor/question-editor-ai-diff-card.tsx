import { StatusPill } from '@/components/app/status-pill';
import { SurfaceCard } from '@/components/app/surface-card';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuestionDraft, QuestionInput } from '@/lib/api';
import { previewValue } from '@/features/questions/editor';

type DraftFieldKey = keyof QuestionInput;

interface QuestionEditorAiDiffCardProps {
  aiDraft: QuestionDraft | null;
  pendingDraftFields: Array<{ key: DraftFieldKey; label: string }>;
  onApplyAll: () => void;
  onApplyField: (field: DraftFieldKey) => void;
  onKeepField: (field: DraftFieldKey) => void;
  value: QuestionInput;
}

export function QuestionEditorAiDiffCard({
  aiDraft,
  pendingDraftFields,
  onApplyAll,
  onApplyField,
  onKeepField,
  value,
}: QuestionEditorAiDiffCardProps) {
  if (!aiDraft) {
    return null;
  }

  return (
    <SurfaceCard tone="glassSoft">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl tracking-[-0.03em]">AI draft diff</CardTitle>
          <CardDescription className="text-sm leading-6">
            Review changes field by field. The current state always stays visible beside the AI
            proposal.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatusPill tone="neutral">{pendingDraftFields.length} pending</StatusPill>
          <Button type="button" onClick={onApplyAll} disabled={pendingDraftFields.length === 0} variant="gradient">
            Apply all AI fields
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pendingDraftFields.length === 0 ? (
          <div className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.8)] p-8 text-sm leading-6 text-muted-foreground ring-1 ring-border/45">
            No unapplied AI differences remain.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingDraftFields.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-[1.5rem] bg-[hsl(var(--surface-low)/0.85)] p-4 ring-1 ring-border/45"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-base font-semibold tracking-[-0.02em] text-foreground">
                    {label}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onApplyField(key)}
                      variant="gradient"
                    >
                      Use AI value
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onKeepField(key)}
                      className="rounded-full bg-white/80"
                    >
                      Keep current
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-white/80 p-4 ring-1 ring-border/40">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Current
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-foreground">
                      {previewValue(value[key])}
                    </pre>
                  </div>
                  <div className="rounded-[1.25rem] bg-[hsl(var(--primary-fixed)/0.7)] p-4 ring-1 ring-[hsl(var(--primary)/0.12)]">
                    <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[hsl(var(--primary))]">
                      AI
                    </div>
                    <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-sm leading-6 text-foreground">
                      {previewValue(aiDraft[key])}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </SurfaceCard>
  );
}
