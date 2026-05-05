import type { RefObject } from 'react';
import { TakeVideoContainer } from './take-video-container';

interface TakeRecordingPreviewProps {
  isRecording: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  videoRef: RefObject<HTMLVideoElement | null>;
}

export function TakeRecordingPreview({
  isRecording,
  timeLeft,
  formatTime,
  videoRef,
}: TakeRecordingPreviewProps) {
  return (
    <TakeVideoContainer>
      <video ref={videoRef} autoPlay muted playsInline className="video-preview" />

      {isRecording ? (
        <div className="timer">
          <span className="rec-dot">●</span> {formatTime(timeLeft)}
        </div>
      ) : null}
    </TakeVideoContainer>
  );
}
