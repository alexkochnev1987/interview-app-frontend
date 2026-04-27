import { Sparkles, WandSparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { QuestionInput } from '@/lib/api';

interface QuestionEditorHeroCardProps {
  title: string;
  difficulty: QuestionInput['difficulty'];
  weight: number;
  pendingDraftFieldsCount: number;
  submitting: boolean;
  aiLoading: boolean;
  onGenerate: () => void;
}

export function QuestionEditorHeroCard({
  title,
  difficulty,
  weight,
  pendingDraftFieldsCount,
  submitting,
  aiLoading,
  onGenerate,
}: QuestionEditorHeroCardProps) {
  return (
    <Card className="border-white/65 bg-white/88 shadow-float">
      <CardContent className="flex flex-col gap-6 px-8 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Unified Question Editor</EyebrowBadge>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
                {title}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Shape the prompt, define the rubric, and keep AI-generated draft suggestions visible
                as explicit diffs instead of invisible background mutations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onGenerate}
              disabled={submitting || aiLoading}
              className="rounded-full bg-white/75"
            >
              <WandSparkles className="size-4" />
              {aiLoading ? 'Generating...' : 'Generate AI Draft'}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricPanel
            label="Difficulty"
            value={<StatusPill tone={difficulty}>{difficulty}</StatusPill>}
            unstyledValue
          />
          <MetricPanel label="Weight" value={weight} />
          <MetricPanel label="Pending AI diffs" value={pendingDraftFieldsCount} />
        </div>
      </CardContent>
    </Card>
  );
}
