import { Sparkles, WandSparkles } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { SurfaceCard } from '@/components/app/surface-card';
import { ActionRow, CardContentHero, HeroDescription, HeroTitle } from '@/components/layout/content-presets';
import { HeaderSplitRow, MetricsThreeUpGrid } from '@/components/layout/grid-layouts';
import { Button } from '@/components/ui/button';
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
    <SurfaceCard tone="glassFloat">
      <CardContentHero>
        <HeaderSplitRow>
          <div className="space-y-4">
            <EyebrowBadge icon={<Sparkles className="size-3.5" />}>Unified Question Editor</EyebrowBadge>
            <div className="space-y-3">
              <HeroTitle>{title}</HeroTitle>
              <HeroDescription>
                Shape the prompt, define the rubric, and keep AI-generated draft suggestions visible
                as explicit diffs instead of invisible background mutations.
              </HeroDescription>
            </div>
          </div>

          <ActionRow>
            <Button
              type="button"
              variant="outline-soft-strong"
              onClick={onGenerate}
              disabled={submitting || aiLoading}
            >
              <WandSparkles className="size-4" />
              {aiLoading ? 'Generating...' : 'Generate AI Draft'}
            </Button>
          </ActionRow>
        </HeaderSplitRow>

        <MetricsThreeUpGrid>
          <MetricPanel
            label="Difficulty"
            value={<StatusPill tone={difficulty}>{difficulty}</StatusPill>}
            unstyledValue
          />
          <MetricPanel label="Weight" value={weight} />
          <MetricPanel label="Pending AI diffs" value={pendingDraftFieldsCount} />
        </MetricsThreeUpGrid>
      </CardContentHero>
    </SurfaceCard>
  );
}
