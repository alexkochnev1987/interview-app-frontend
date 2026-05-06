import type { RefObject } from 'react';
import { RecordingCameraVideo, RecordingScreenVideo } from '@/components/ui/recording-preview';
import { TakeVideoContainer } from './take-video-container';
import { TakeRecordingTimer } from './take-recording-timer';

interface TakeRecordingPreviewProps {
  isRecording: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  videoRef: RefObject<HTMLVideoElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
}

export function TakeRecordingPreview({
  isRecording,
  timeLeft,
  formatTime,
  videoRef,
  screenVideoRef,
}: TakeRecordingPreviewProps) {
  return (
    <TakeVideoContainer>
      <RecordingScreenVideo videoRef={screenVideoRef} />
      <RecordingCameraVideo videoRef={videoRef} />

      {isRecording ? <TakeRecordingTimer timeLabel={formatTime(timeLeft)} /> : null}
    </TakeVideoContainer>
  );
}
