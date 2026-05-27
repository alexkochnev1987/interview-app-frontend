'use client';

import type { ReactNode, RefObject } from 'react';

import { Video } from 'lucide-react';

import { EyebrowBadge } from '@/components/ui/eyebrow-badge';
import type { StatusTone } from '@/components/ui/status-pill';
import { SurfaceCard } from '@/components/ui/surface-card';
import { PageMainViewport } from '@/components/layout/page-shell';
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
import { takeMessage } from '@/features/take';

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
  const joinLabel = setupBusy ? takeMessage('lobbyJoinBusy') : takeMessage('lobbyJoin');

  let previewOverlay: ReactNode = null;
  if (!permissionGranted) {
    previewOverlay = (
      <LobbyPreviewPlaceholder
        title={takeMessage('lobbyPreviewMutedTitle')}
        description={takeMessage('lobbyPreviewMutedLead')}
      />
    );
  } else if (!lobbyCameraOn) {
    previewOverlay = (
      <LobbyPreviewPlaceholder
        title={takeMessage('lobbyPreviewCameraOffTitle')}
        description={takeMessage('lobbyPreviewCameraOffLead')}
      />
    );
  }

  return (
    <PageMainViewport>
      <SurfaceCard tone="glassFloat" grow="fill" size="lg">
        <CardContent layout="fill-column" spacing="xl">
          <EyebrowBadge icon={<Video size={14} />}>{takeMessage('lobbyEyebrow')}</EyebrowBadge>
          <Grid columns="lobby-shell" gap={10} grow="fill">
            <Stack gap={5} width="full" height="full">
              <Text variant="heroDescription">{takeMessage('lobbyLead')}</Text>
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
                <CardTitle size="lg">{takeMessage('lobbyDevicesAndScreens')}</CardTitle>
                <Text variant="bodyMutedSm">{takeMessage('lobbyDevicesHelp')}</Text>
              </Stack>
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
                    <AlertTitle>{takeMessage('lobbySetupFailed')}</AlertTitle>
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
    </PageMainViewport>
  );
}
