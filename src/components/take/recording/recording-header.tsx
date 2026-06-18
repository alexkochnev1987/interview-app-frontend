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
import { TakeRecordingHeaderStatus } from '@/components/take/recording/recording-header-status';
import type { InterviewDataView, TakeStage } from '@/components/take/types';
import type { VersionPersistKind } from '@/features/take/session-machine';
import { TAKE_RECORDING_LIMIT_SECONDS, formatRecordingLimitLabel } from '@/features/take';
import { Heading } from '@/components/ui/heading';
import { useTranslations } from 'next-intl';

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
  const tTake = useTranslations('takeFlow');
  const recordingLimitLabel = formatRecordingLimitLabel(TAKE_RECORDING_LIMIT_SECONDS);
  const previousVersionsKept = interview.currentAnswerMeta?.versionCount ?? 0;

  return (
    <>
      <RecordingHeaderShell>
        <RecordingHeaderRow>
          <RecordingHeaderTitleCluster>
            <Heading variant="toolbarSessionTitle" level={2}>
              {`${interview.position} - ${tTake('recordingSessionTitleInterview')}`}
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
            <Inline wrap="nowrap" align="center" gap={2}>
              <StatusPill tone="completed" size="header">
                {tTake('recordingHeaderCameraMic')}
              </StatusPill>
              <TakeRecordingHeaderStatus
                screenSurface={screenSurface}
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
