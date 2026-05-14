import { StatusPill } from '@/components/ui/status-pill';
import { BodyText } from '@/components/ui/text';
import { Inline } from '@/components/ui/layout';
import {
  RecordingSessionHeaderCluster,
  RecordingSessionHeaderRow,
  RecordingSessionHeaderShell,
} from '@/components/ui/recording-session-header-shell';
import {
  RecordingSessionInlineMetrics,
  SessionLiveIndicator,
} from '@/components/ui/recording-session-toolbar';
import { TakeRecordingStatus } from '@/components/take/recording/take-recording-status';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { VersionPersistKind } from '@/features/take/session-machine';
import { TAKE_RECORDING_LIMIT_SECONDS, formatRecordingLimitLabel } from '@/features/take';
import { Heading } from '@/components/ui/heading';

interface TakeRecordingSessionHeaderProps {
  interview: InterviewDataView;
  currentVersionNumber: number;
  screenSurface: string;
  setupError: string;
  stage: TakeStage;
  recording: boolean;
  recordingStartBusy: boolean;
  versionPersistKind: VersionPersistKind | null;
}

export function TakeRecordingSessionHeader({
  interview,
  currentVersionNumber,
  screenSurface,
  setupError,
  stage,
  recording,
  recordingStartBusy,
  versionPersistKind,
}: TakeRecordingSessionHeaderProps) {
  const recordingLimitLabel = formatRecordingLimitLabel(TAKE_RECORDING_LIMIT_SECONDS);
  const previousVersionsKept = interview.currentAnswerMeta?.versionCount ?? 0;

  return (
    <>
      <RecordingSessionHeaderShell>
        <RecordingSessionHeaderRow>
          <RecordingSessionHeaderCluster>
            <SessionLiveIndicator />
            <Heading variant="toolbarSessionTitle" level={2}>
              {interview.position}
            </Heading>
          </RecordingSessionHeaderCluster>

          <RecordingSessionHeaderCluster>
            <RecordingSessionInlineMetrics
              recordingLimitLabel={recordingLimitLabel}
              answerVersionNumber={currentVersionNumber}
              previousVersionsKept={previousVersionsKept}
              versionActivity={stage === 'transition' ? 'saving' : 'idle'}
            />
          </RecordingSessionHeaderCluster>
          

          <RecordingSessionHeaderCluster>
            <Inline wrap="nowrap" align="center" gap={3}>
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
          </RecordingSessionHeaderCluster>
        </RecordingSessionHeaderRow>
      </RecordingSessionHeaderShell>

      {setupError ? (
        <BodyText as="span" size="xs" tone="danger" weight="medium">
          {setupError}
        </BodyText>
      ) : null}
    </>
  );
}
