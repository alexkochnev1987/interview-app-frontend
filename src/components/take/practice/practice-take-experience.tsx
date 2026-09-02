'use client'

import { useTranslations } from 'next-intl'

import { PageMainViewport } from '@/components/layout/page-shell'
import { TakeConsentScreen } from '@/components/take/consent/consent-screen'
import { TakeLobbyScreen } from '@/components/take/lobby/lobby-screen'
import { TakeRecordingScreen } from '@/components/take/recording/recording-screen'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/ui/layout/inline'
import { Stack } from '@/components/ui/layout/stack'
import { UnstyledLink } from '@/components/ui/unstyled-link'
import { usePracticeTakeExperience } from '@/features/practice/use-practice-take-experience'
import { TakeMediaProvider } from '@/features/take/take-media-context'
import { formatTime, permissionTone } from '@/features/take/utils'
import { routes } from '@/i18n/routes'

import { PracticeCompleteScreen } from './practice-complete-screen'

interface PracticeTakeExperienceProps {
  candidateName: string
}

export function PracticeTakeExperience({ candidateName }: PracticeTakeExperienceProps) {
  const tPractice = useTranslations('practice')
  const questionTexts = [tPractice('questions.aboutYourself'), tPractice('questions.whyInterested')]
  const position = tPractice('position')
  const practice = usePracticeTakeExperience({ candidateName, position, questionTexts })

  return (
    <TakeMediaProvider cameraStream={practice.cameraStream}>
      <PageMainViewport spacing="take">
        <Stack gap={4} grow="fill" width="full">
          <Inline justify="end">
            <Button asChild type="button" variant="ghost" size="sm">
              <UnstyledLink href={routes.portal.home}>{tPractice('exitLabel')}</UnstyledLink>
            </Button>
          </Inline>

          {practice.stage === 'consent' ? (
            <TakeConsentScreen
              interview={practice.interview}
              consent={practice.consent}
              setupError={practice.setupError}
              eyebrowOverride={tPractice('eyebrow')}
              headingOverride={tPractice('heading')}
              checkboxHintOverride={tPractice('checkboxHint')}
              fairnessDescriptionOverride={tPractice('fairnessDescription')}
              onConsentChange={practice.setConsent}
              onContinueToLobby={practice.onContinueToLobby}
            />
          ) : null}

          {practice.stage === 'lobby' ? (
            <TakeLobbyScreen
              cameraStatus={practice.cameraStatus}
              screenStatus={practice.screenStatus}
              screenSurface={practice.screenSurface}
              setupBusy={practice.setupBusy}
              setupError={practice.setupError}
              videoRef={practice.videoRef}
              cameraStream={practice.cameraStream}
              permissionLabel={practice.permissionLabel}
              permissionTone={permissionTone}
              lobbyMicOn={practice.lobbyMicOn}
              lobbyCameraOn={practice.lobbyCameraOn}
              lobbyJoinReady={practice.captureReady}
              onToggleMic={practice.onToggleMic}
              onToggleCamera={practice.onToggleCamera}
              onScreenShare={practice.onScreenShare}
              onJoin={practice.onJoin}
            />
          ) : null}

          {practice.stage === 'interview' || practice.stage === 'recording' ? (
            <TakeRecordingScreen
              interview={practice.interview}
              currentVersionNumber={practice.versionNumber}
              stage={practice.stage}
              recording={practice.recording}
              progressValue={practice.progressValue}
              screenSurface={practice.screenSurface}
              setupError={practice.setupError}
              capturePipelineReady={practice.captureReady}
              submitError=""
              actionErrorKind={null}
              timeLeft={practice.timeLeft}
              versionPersistKind={null}
              uploading={false}
              isBrowserTranscriptSupported={false}
              finalTranscript=""
              interimTranscript=""
              videoRef={practice.videoRef}
              screenVideoRef={practice.screenVideoRef}
              interviewerPresence={practice.interviewerPresence}
              formatTime={formatTime}
              recordingStartBusy={false}
              retakeDisabled={false}
              displayedAttemptNumber={practice.versionNumber}
              maxAttempts={practice.interview.maxAttempts}
              attemptsExhausted={false}
              submitAllowed={practice.recording}
              exhaustedHint={null}
              showDeviceReconnect
              onReconnect={() => undefined}
              onRerecord={practice.onRerecord}
              onSubmit={practice.onSubmit}
            />
          ) : null}

          {practice.stage === 'complete' ? (
            <PracticeCompleteScreen candidateName={candidateName} />
          ) : null}
        </Stack>
      </PageMainViewport>
    </TakeMediaProvider>
  )
}
