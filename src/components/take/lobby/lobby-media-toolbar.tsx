import { Mic, MicOff, SquareArrowUp, Video, VideoOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Inline } from '@/components/ui/layout';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeLobbyMediaToolbarProps {
  setupBusy: boolean;
  micOn: boolean;
  cameraOn: boolean;
  screenShareReady: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onScreenShare: () => void;
}

export function TakeLobbyMediaToolbar({
  setupBusy,
  micOn,
  cameraOn,
  screenShareReady,
  onToggleMic,
  onToggleCamera,
  onScreenShare,
}: TakeLobbyMediaToolbarProps) {
  return (
    <Inline justify="center" gap={3}>
      <Button
        type="button"
        variant={micOn ? 'secondary' : 'outline'}
        size="icon-prep-room"
        shape="pill"
        disabled={setupBusy}
        aria-pressed={micOn}
        aria-label={TAKE_MESSAGES.lobbyToolbarMic}
        onClick={() => void onToggleMic()}
      >
        {micOn ? <Mic /> : <MicOff />}
      </Button>
      <Button
        type="button"
        variant={cameraOn ? 'secondary' : 'outline'}
        size="icon-prep-room"
        shape="pill"
        disabled={setupBusy}
        aria-pressed={cameraOn}
        aria-label={TAKE_MESSAGES.lobbyToolbarCamera}
        onClick={() => void onToggleCamera()}
      >
        {cameraOn ? <Video /> : <VideoOff />}
      </Button>
      <Button
        type="button"
        variant={screenShareReady ? 'secondary' : 'outline'}
        size="icon-prep-room"
        shape="pill"
        disabled={setupBusy}
        aria-pressed={screenShareReady}
        aria-label={TAKE_MESSAGES.lobbyToolbarScreen}
        onClick={() => void onScreenShare()}
      >
        <SquareArrowUp />
      </Button>
    </Inline>
  );
}
