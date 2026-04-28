import type { RefObject } from 'react';

interface TakeRecordingPreviewProps {
  isRecording: boolean;
  timeLeft: number;
  formatTime: (seconds: number) => string;
  videoRef: RefObject<HTMLVideoElement>;
}

export function TakeRecordingPreview({
  isRecording,
  timeLeft,
  formatTime,
  videoRef,
}: TakeRecordingPreviewProps) {
  return (
    <div className="video-container ring-1 ring-border/45">
      <video ref={videoRef} autoPlay muted playsInline className="video-preview" />

      {isRecording ? (
        <div className="timer">
          <span className="rec-dot">●</span> {formatTime(timeLeft)}
        </div>
      ) : null}
    </div>
  );
}
