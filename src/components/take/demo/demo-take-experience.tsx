'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import {
  TakeCompleteScreen,
  TakeConsentScreen,
  TakeLobbyScreen,
  TakeRecordingScreen,
} from '@/components/take'
import { formatTime, permissionTone } from '@/features/take/utils'
import { useDemoTakeExperience } from './use-demo-take-experience'

interface DemoTakeExperienceProps {
  candidateName: string
  position: string
  questionTexts: string[]
  onExit: () => void
}

export function DemoTakeExperience({
  candidateName,
  position,
  questionTexts,
  onExit,
}: DemoTakeExperienceProps) {
  const t = useTranslations('common')
  const demo = useDemoTakeExperience({ candidateName, position, questionTexts })

  return (
    <Stack gap={2} grow="fill">
      <Inline justify="end">
        <Button type="button" variant="ghost" size="sm" onClick={onExit}>
          {t('demoMode.exit')}
        </Button>
      </Inline>

      {demo.stage === 'consent' ? (
        <TakeConsentScreen
          interview={demo.interview}
          consent={demo.consent}
          setupError={demo.setupError}
          onConsentChange={demo.setConsent}
          onContinueToLobby={demo.onContinueToLobby}
        />
      ) : null}

      {demo.stage === 'lobby' ? (
        <TakeLobbyScreen
          cameraStatus={demo.cameraStatus}
          screenStatus={demo.screenStatus}
          screenSurface="monitor"
          setupBusy={demo.cameraStatus === 'pending'}
          setupError={demo.setupError}
          videoRef={demo.videoRef}
          permissionLabel={demo.permissionLabel}
          permissionTone={permissionTone}
          lobbyMicOn={demo.lobbyMicOn}
          lobbyCameraOn={demo.lobbyCameraOn}
          lobbyJoinReady={demo.cameraStatus === 'granted'}
          onToggleMic={demo.onToggleMic}
          onToggleCamera={demo.onToggleCamera}
          onScreenShare={demo.onScreenShare}
          onJoin={demo.onJoin}
        />
      ) : null}

      {demo.stage === 'interview' || demo.stage === 'recording' ? (
        <TakeRecordingScreen
          interview={demo.interview}
          currentVersionNumber={demo.versionNumber}
          stage={demo.stage}
          recording={demo.recording}
          progressValue={demo.progressValue}
          screenSurface="monitor"
          setupError={demo.setupError}
          capturePipelineReady={demo.cameraStatus === 'granted'}
          submitError=""
          timeLeft={demo.timeLeft}
          versionPersistKind={null}
          uploading={false}
          isBrowserTranscriptSupported={false}
          finalTranscript=""
          interimTranscript=""
          videoRef={demo.videoRef}
          screenVideoRef={demo.screenVideoRef}
          interviewerPresence={demo.interviewerPresence}
          formatTime={formatTime}
          recordingStartBusy={false}
          onReconnect={() => undefined}
          onRerecord={demo.onRerecord}
          onSubmit={demo.onSubmit}
        />
      ) : null}

      {demo.stage === 'complete' ? (
        <TakeCompleteScreen candidateName={candidateName} position={position} />
      ) : null}
    </Stack>
  )
}
