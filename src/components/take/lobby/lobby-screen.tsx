'use client';

import type { ReactNode, RefObject } from 'react';

import { Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import type { StatusTone } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import {
  LobbyPrepFloatingControls,
  LobbyPreviewFrame,
  LobbyPreviewPlaceholder,
  LobbyScreenVideo,
} from '@/components/ui/take';
import { TakePermissionStatusList } from '../consent/consent-permission-status-list';
import { TakeLobbyMediaToolbar } from './lobby-media-toolbar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CardContent, CardTitle } from '@/components/ui/card';
import { Grid, Stack } from '@/components/ui/layout';
import { Text } from '@/components/ui/text';
import type { PermissionStatus } from '@/components/take/types';

interface TakeLobbyScreenProps {
  cameraStatus: PermissionStatus;
  screenStatus: PermissionStatus;
  screenSurface: string;
  setupBusy: boolean;
  setupError: string;
  videoRef: RefObject<HTMLVideoElement | null>;
  cameraStream?: MediaStream | null;
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
  cameraStream,
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
  const tTake = useTranslations('takeFlow');
  const permissionGranted = cameraStatus === 'granted';
  const screenShareReady = screenStatus === 'granted' && screenSurface === 'monitor';
  const showScreenShareHint = !screenShareReady;
  const joinLabel = setupBusy ? tTake('lobbyJoinBusy') : tTake('lobbyJoin');

  let previewOverlay: ReactNode = null;
  if (!permissionGranted) {
    previewOverlay = (
      <LobbyPreviewPlaceholder
        title={tTake('lobbyPreviewMutedTitle')}
        description={tTake('lobbyPreviewMutedLead')}
      />
    );
  } else if (!lobbyCameraOn) {
    previewOverlay = (
      <LobbyPreviewPlaceholder
        title={tTake('lobbyPreviewCameraOffTitle')}
        description={tTake('lobbyPreviewCameraOffLead')}
      />
    );
  }

  return (
    <SurfaceCard tone="glassFloat" grow="fill" size="lg">
      <CardContent layout="fill-column" spacing="xl">
          <EyebrowBadge icon={<Video size={14} />}>{tTake('lobbyEyebrow')}</EyebrowBadge>
          <Grid columns="lobby-shell" gap={10} grow="fill">
            <Stack gap={5} width="full" height="full">
              <Text variant="heroDescription">{tTake('lobbyLead')}</Text>
              <Stack grow="fill" width="full">
                <LobbyPreviewFrame>
                  <LobbyScreenVideo videoRef={videoRef} />
                  {previewOverlay}
                  <LobbyPrepFloatingControls>
                    <TakeLobbyMediaToolbar
                      setupBusy={setupBusy}
                      micOn={permissionGranted && lobbyMicOn}
                      cameraOn={permissionGranted && lobbyCameraOn}
                      screenShareReady={screenShareReady}
                      cameraStream={cameraStream ?? null}
                      onToggleMic={onToggleMic}
                      onToggleCamera={onToggleCamera}
                      onScreenShare={onScreenShare}
                    />
                  </LobbyPrepFloatingControls>
                </LobbyPreviewFrame>
              </Stack>
            </Stack>

            <Stack width="full" placeSelf="start">
              <Stack gap={2}>
                <CardTitle size="lg">{tTake('lobbyDevicesAndScreens')}</CardTitle>
                <Text variant="bodyMutedSm">{tTake('lobbyDevicesHelp')}</Text>
              </Stack>
              <Stack gap={5}>
                {showScreenShareHint ? (
                  <Alert variant="warning">
                    <AlertTitle>{tTake('lobbyScreenShareHintTitle')}</AlertTitle>
                    <AlertDescription>{tTake('lobbyScreenShareHint')}</AlertDescription>
                  </Alert>
                ) : null}

                <TakePermissionStatusList
                  cameraStatus={cameraStatus}
                  screenStatus={screenStatus}
                  screenSurface={screenSurface}
                  permissionLabel={permissionLabel}
                  permissionTone={permissionTone}
                />

                {setupError ? (
                  <Alert variant="destructive">
                    <AlertTitle>{tTake('lobbySetupFailed')}</AlertTitle>
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
            </Stack>
          </Grid>
        </CardContent>
    </SurfaceCard>
  );
}
