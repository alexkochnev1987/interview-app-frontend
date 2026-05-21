import { StatusPill } from '@/components/ui/status-pill';
import { BodyText } from '@/components/ui/text';
import { Inline } from '@/components/ui/layout';
import {
  RecordingHeaderCluster,
  RecordingHeaderInlineMetrics,
  RecordingHeaderRow,
  RecordingHeaderShell,
  RecordingHeaderTitleCluster,
} from '@/components/ui/take';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import { TAKE_RECORDING_LIMIT_SECONDS, formatRecordingLimitLabel, TAKE_MESSAGES } from '@/features/take';
import { Heading } from '@/components/ui/heading';

interface TakeRecordingHeaderProps {
  interview: InterviewDataView;
  currentVersionNumber: number;
  setupError: string;
  stage: TakeStage;
}

export function TakeRecordingHeader({
  interview,
  currentVersionNumber,
  setupError,
  stage,
}: TakeRecordingHeaderProps) {
  const recordingLimitLabel = formatRecordingLimitLabel(TAKE_RECORDING_LIMIT_SECONDS);
  const previousVersionsKept = interview.currentAnswerMeta?.versionCount ?? 0;

  return (
    <>
      <RecordingHeaderShell>
        <RecordingHeaderRow>
          <RecordingHeaderTitleCluster>
            <Heading variant="toolbarSessionTitle" level={2}>
              {`${interview.position} - ${TAKE_MESSAGES.recordingSessionTitleInterview}`}
            </Heading>
          </RecordingHeaderTitleCluster>

          <RecordingHeaderCluster>
            <RecordingHeaderInlineMetrics
              recordingLimitLabel={recordingLimitLabel}
              answerVersionNumber={currentVersionNumber}
              previousVersionsKept={previousVersionsKept}
              versionActivity={stage === 'transition' ? 'saving' : 'idle'}
            />
          </RecordingHeaderCluster>

          <RecordingHeaderCluster>
            <Inline wrap="wrap" align="center" gap={3}>
              <StatusPill tone="completed" size="compact">
                Camera + mic
              </StatusPill>
              <StatusPill tone="completed" size="compact">
                Full screen
              </StatusPill>
              <StatusPill tone="processing" size="compact">
                Recording
              </StatusPill>
            </Inline>
          </RecordingHeaderCluster>
        </RecordingHeaderRow>
      </RecordingHeaderShell>

      {setupError ? (
        <BodyText as="span" size="xs" tone="danger" weight="medium">
          {setupError}
        </BodyText>
      ) : null}
    </>
  );
}
