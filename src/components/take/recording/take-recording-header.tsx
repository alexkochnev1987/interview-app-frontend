import { Video } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { TakePanel } from '@/components/take/take-panel';
import type { InterviewDataView } from '@/components/take/types';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

interface TakeRecordingHeaderProps {
  interview: InterviewDataView;
  progressValue: number;
  screenSurface: string;
  setupError: string;
  currentVersionNumber: number;
  retakeCount: number;
}

export function TakeRecordingHeader({
  interview,
  progressValue,
  screenSurface,
  setupError,
  currentVersionNumber,
  retakeCount,
}: TakeRecordingHeaderProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <EyebrowBadge icon={<Video className="size-3.5" />}>Live session</EyebrowBadge>
        <Heading variant="sectionHeroTitle">{interview.position}</Heading>
        <Text variant="bodyMutedSm">
          Answer clearly and keep your camera plus entire-screen share active while recording.
        </Text>
      </div>

      <TakePanel tone="surfaceStrong" radius="lg" padding="lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium text-foreground">
              Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
            </div>
            <StatusPill tone="neutral">{progressValue}%</StatusPill>
          </div>
          <Progress value={progressValue} className="h-2.5 rounded-full bg-white" />
        </div>
      </TakePanel>

      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="completed">Camera + mic active</StatusPill>
          <StatusPill tone="completed">
            {screenSurface === 'monitor' ? 'Entire screen shared' : 'Screen share pending'}
          </StatusPill>
        </div>
        {setupError ? (
          <Alert variant="destructive">
            <AlertTitle>Capture interrupted</AlertTitle>
            <AlertDescription>{setupError}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricPanel tone="elevated" label="Recording limit" value="4:00" />
        <MetricPanel
          tone="elevated"
          label="Answer version"
          value={`v${currentVersionNumber}`}
          valueClassName="mt-3 text-sm leading-6 text-foreground"
          description={`Previous versions kept: ${retakeCount}`}
        />
      </div>
    </div>
  );
}
