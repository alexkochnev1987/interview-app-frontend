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
import { TakeRecordingStatus } from './recording-status';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { VersionPersistKind } from '@/features/take/session-machine';
import { TAKE_RECORDING_LIMIT_SECONDS, formatRecordingLimitLabel, TAKE_MESSAGES } from '@/features/take';
import { Heading } from '@/components/ui/heading';

interface TakeRecordingHeaderProps {
  interview: InterviewDataView;
  currentVersionNumber: number;
  screenSurface: string;
  setupError: string;
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  versionPersistKind: VersionPersistKind | null;
}

export function TakeRecordingHeader({
  interview,
  currentVersionNumber,
  screenSurface,
  setupError,
  stage,
  recording,
  recordingStartBusy,
  versionPersistKind,
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
                {screenSurface === 'monitor' ? 'Full screen' : 'Screen pending'}
              </StatusPill>
              <TakeRecordingStatus
                density="compact"
                stage={stage}
                recording={recording}
                recordingStartBusy={recordingStartBusy}
                versionPersistKind={versionPersistKind}
              />
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
