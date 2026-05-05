import type { RefObject } from 'react';
import { TakeVideoContainer } from './take-video-container';

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
      <video ref={screenVideoRef} autoPlay muted playsInline className="video-preview video-preview-screen" />
      <video ref={videoRef} autoPlay muted playsInline className="video-preview video-preview-camera" />

      {isRecording ? (
        <div className="timer">
          <span className="rec-dot">●</span> {formatTime(timeLeft)}
        </div>
      ) : null}
    </TakeVideoContainer>
  );
}
