import type { ReactNode, RefObject } from 'react';

import { Video } from 'lucide-react';

import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import type { StatusTone } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { RecordingPrepRoomFloatingControls, RecordingPreviewFrame, RecordingPreviewPlaceholder, RecordingScreenVideo } from '@/components/ui/recording-preview';
import { PageMainViewport } from '@/components/layout/page-shell';
import { TakeLobbyMediaToolbar } from '@/components/take/lobby/take-lobby-media-toolbar';
import { TakePermissionStatusList } from '@/components/take/consent/take-permission-status-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import type { PermissionStatus } from '@/components/take/types';
import { TAKE_MESSAGES } from '@/features/take';

interface TakeLobbyScreenProps {
  cameraStatus: PermissionStatus;
  screenStatus: PermissionStatus;
  screenSurface: string;
  setupBusy: boolean;
  setupError: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  permissionLabel: (status: PermissionStatus) => string;
  permissionTone: (status: PermissionStatus) => StatusTone;
  lobbyMicOn: boolean;
  lobbyCameraOn: boolean;
  lobbyJoinReady: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onScreenShare: () => void;
  onJoin: () => void;
}

export function TakeLobbyScreen({
  cameraStatus,
  screenStatus,
  screenSurface,
  setupBusy,
  setupError,
  videoRef,
  permissionLabel,
  permissionTone,
  lobbyMicOn,
  lobbyCameraOn,
  lobbyJoinReady,
  onToggleMic,
  onToggleCamera,
  onScreenShare,
  onJoin,
}: TakeLobbyScreenProps) {
  const permissionGranted = cameraStatus === 'granted';
  const screenShareReady = screenStatus === 'granted' && screenSurface === 'monitor';
  const joinLabel = setupBusy ? TAKE_MESSAGES.lobbyJoinBusy : TAKE_MESSAGES.lobbyJoin;

  let previewOverlay: ReactNode = null;
  if (!permissionGranted) {
    previewOverlay = (
      <RecordingPreviewPlaceholder
        title={TAKE_MESSAGES.lobbyPreviewMutedTitle}
        description={TAKE_MESSAGES.lobbyPreviewMutedLead}
      />
    );
  } else if (!lobbyCameraOn) {
    previewOverlay = (
      <RecordingPreviewPlaceholder
        title={TAKE_MESSAGES.lobbyPreviewCameraOffTitle}
        description={TAKE_MESSAGES.lobbyPreviewCameraOffLead}
      />
    );
  }

  return (
    <PageMainViewport>
      <SurfaceCard tone="glassFloat" grow="fill">
        <CardContent layout="fill-column" spacing="xl">
          <Grid columns="lobby-shell" gap={8} grow="fill">
            <Stack gap={5} width="full" height="full">
              <EyebrowBadge icon={<Video size={14} />}>{TAKE_MESSAGES.lobbyEyebrow}</EyebrowBadge>

              <Text variant="heroDescription">{TAKE_MESSAGES.lobbyLead}</Text>

              <Stack grow="fill" width="full">
                <RecordingPreviewFrame layout="growLobby">
                  <RecordingScreenVideo videoRef={videoRef} />
                  {previewOverlay}
                  <RecordingPrepRoomFloatingControls>
                    <TakeLobbyMediaToolbar
                      setupBusy={setupBusy}
                      micOn={permissionGranted && lobbyMicOn}
                      cameraOn={permissionGranted && lobbyCameraOn}
                      screenShareReady={screenShareReady}
                      onToggleMic={onToggleMic}
                      onToggleCamera={onToggleCamera}
                      onScreenShare={onScreenShare}
                    />
                  </RecordingPrepRoomFloatingControls>
                </RecordingPreviewFrame>
              </Stack>
            </Stack>

            <Stack width="full" placeSelf="start">
              <SurfaceCard tone="glassSoftFlat" flexChild="contain">
                <CardHeader>
                  <Stack gap={2}>
                    <CardTitle size="lg">Devices & screens</CardTitle>
                    <Text variant="bodyMutedSm">{TAKE_MESSAGES.lobbyDevicesHelp}</Text>
                  </Stack>
                </CardHeader>

                <CardContent spacing="lg">
                  <Stack gap={5}>
                    <TakePermissionStatusList
                      cameraStatus={cameraStatus}
                      screenStatus={screenStatus}
                      screenSurface={screenSurface}
                      permissionLabel={permissionLabel}
                      permissionTone={permissionTone}
                    />

                    {setupError ? (
                      <Alert variant="destructive">
                        <AlertTitle>Could not finish setup</AlertTitle>
                        <AlertDescription>{setupError}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Stack width="full">
                      <Button
                        type="button"
                        disabled={!lobbyJoinReady || setupBusy}
                        variant="gradient"
                        size="2xl"
                        shape="rounded"
                        width="full"
                        onClick={onJoin}
                      >
                        {joinLabel}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </SurfaceCard>
            </Stack>
          </Grid>
        </CardContent>
      </SurfaceCard>
    </PageMainViewport>
  );
}
