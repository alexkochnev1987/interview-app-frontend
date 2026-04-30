import { Video } from 'lucide-react';

import { EyebrowBadge } from '@/components/app/eyebrow-badge';
import { MetricPanel } from '@/components/app/metric-panel';
import { StatusPill } from '@/components/app/status-pill';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Grid, Inline, Stack } from '@/components/ui/layout';
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
    <Stack gap={6}>
      <Stack gap={3}>
        <EyebrowBadge icon={<Video size={14} />}>Live session</EyebrowBadge>
        <Heading variant="sectionHeroTitle">{interview.position}</Heading>
        <Text variant="bodyMutedSm">
          Answer clearly and keep your camera plus entire-screen share active while recording.
        </Text>
      </Stack>

      <TakePanel tone="surfaceStrong" radius="lg" padding="lg">
        <Stack gap={3}>
          <Inline align="center" justify="between" gap={3}>
            <Text as="span" variant="labelSm">
              Question {interview.currentQuestionIndex + 1} of {interview.totalQuestions}
            </Text>
            <StatusPill tone="neutral">{progressValue}%</StatusPill>
          </Inline>
          <Progress value={progressValue} size="md" tone="softLight" />
        </Stack>
      </TakePanel>

      <Stack gap={3}>
        <Inline wrap gap={2}>
          <StatusPill tone="completed">Camera + mic active</StatusPill>
          <StatusPill tone="completed">
            {screenSurface === 'monitor' ? 'Entire screen shared' : 'Screen share pending'}
          </StatusPill>
        </Inline>
        {setupError ? (
          <Alert variant="destructive">
            <AlertTitle>Capture interrupted</AlertTitle>
            <AlertDescription>{setupError}</AlertDescription>
          </Alert>
        ) : null}
      </Stack>

      <Grid columns="2-md" gap={4}>
        <MetricPanel tone="elevated" label="Recording limit" value="4:00" />
        <MetricPanel
          tone="elevated"
          label="Answer version"
          value={`v${currentVersionNumber}`}
          valueVariant="bodySm"
          description={`Previous versions kept: ${retakeCount}`}
        />
      </Grid>
    </Stack>
  );
}
