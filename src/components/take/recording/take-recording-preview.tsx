import type { RefObject } from 'react';

import { RecordingAiInterviewerSessionLayout } from '@/components/ui/recording-preview';
import type { TakeStage } from '@/components/take/types';
import type { InterviewerPresence } from '@/features/take/use-take-question-tts';
import { TakeVideoContainer } from './take-video-container';
import { TakeRecordingTimer } from './take-recording-timer';

interface TakeRecordingPreviewProps {
  stage: TakeStage;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  videoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  micOn: boolean;
  interviewerPresence: InterviewerPresence;
}

export function TakeRecordingPreview({
  stage,
  timeLeft,
  formatTime,
  videoRef,
  screenVideoRef,
  micOn,
  interviewerPresence,
}: TakeRecordingPreviewProps) {
  return (
    <TakeVideoContainer layout="grow">
      <RecordingAiInterviewerSessionLayout
        cameraVideoRef={videoRef}
        screenVideoRef={screenVideoRef}
        micOn={micOn}
        interviewerPresence={interviewerPresence}
        timerOverlay={
          stage === 'recording' || stage === 'transition' ? (
            <TakeRecordingTimer timeLabel={formatTime(timeLeft)} />
          ) : null
        }
      />
    </TakeVideoContainer>
  );
}
