'use client'

import { useParams, useSearchParams } from 'next/navigation'

import { useTakeOrchestrator } from '@/features/take'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoadingStateCard } from '@/components/ui/state-card'
import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { TakeCompleteScreen } from '@/components/take/take-complete-screen'
import { TakeConsentScreen } from '@/components/take/take-consent-screen'
import { TakeLobbyScreen } from '@/components/take/take-lobby-screen'
import { TakeRecordingScreen } from '@/components/take/take-recording-screen'

export default function TakeInterviewPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const candidateToken = searchParams.get('token')?.trim() ?? ''
  const {
    stage,
    interview,
    error,
    consent,
    cameraStatus,
    screenStatus,
    screenSurface,
    setupBusy,
    setupError,
    submitError,
    timeLeft,
    versionPersistKind,
    uploading,
    isBrowserTranscriptSupported,
    finalTranscript,
    interimTranscript,
    browserTranscriptWarning,
    videoRef,
    screenVideoRef,
    progressValue,
    setConsent,
    proceedToLobby,
    restartFullInterviewCapture,
    attachLobbyScreenShare,
    toggleLobbyMic,
    toggleLobbyCamera,
    lobbyMicOn,
    lobbyCameraOn,
    lobbyJoinReady,
    recording,
    startInterviewFromLobby,
    recordingStartBusy,
    currentVersionNumber,
    requestVersionAction,
    permissionLabel,
    permissionTone,
    formatTime,
    interviewerPresence,
  } = useTakeOrchestrator({ id, candidateToken })

  if (error && !interview) {
    return (
      <PageMainLayout>
        <PageContent>
          <Alert variant="destructive">
            <AlertTitle>Interview unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </PageContent>
      </PageMainLayout>
    )
  }

  if (stage === 'loading' || !interview) {
    return (
      <PageMainLayout>
        <PageContent>
          <LoadingStateCard label="Loading interview..." />
        </PageContent>
      </PageMainLayout>
    )
  }

  if (stage === 'complete') {
    return (
      <TakeCompleteScreen candidateName={interview.candidateName} position={interview.position} />
    )
  }

  if (stage === 'consent') {
    return (
      <TakeConsentScreen
        interview={interview}
        consent={consent}
        setupError={setupError}
        onConsentChange={setConsent}
        onContinueToLobby={proceedToLobby}
      />
    )
  }

  if (stage === 'lobby') {
    return (
      <TakeLobbyScreen
        cameraStatus={cameraStatus}
        screenStatus={screenStatus}
        screenSurface={screenSurface}
        setupBusy={setupBusy}
        setupError={setupError}
        videoRef={videoRef}
        permissionLabel={permissionLabel}
        permissionTone={permissionTone}
        lobbyMicOn={lobbyMicOn}
        lobbyCameraOn={lobbyCameraOn}
        lobbyJoinReady={lobbyJoinReady}
        onToggleMic={() => void toggleLobbyMic()}
        onToggleCamera={() => void toggleLobbyCamera()}
        onScreenShare={() => void attachLobbyScreenShare()}
        onJoin={startInterviewFromLobby}
      />
    )
  }

  return (
    <TakeRecordingScreen
      interview={interview}
      currentVersionNumber={currentVersionNumber}
      stage={stage}
      recording={recording}
      progressValue={progressValue}
      screenSurface={screenSurface}
      setupError={setupError}
      submitError={submitError}
      timeLeft={timeLeft}
      versionPersistKind={versionPersistKind}
      uploading={uploading}
      isBrowserTranscriptSupported={isBrowserTranscriptSupported}
      finalTranscript={finalTranscript}
      interimTranscript={interimTranscript}
      browserTranscriptWarning={browserTranscriptWarning}
      videoRef={videoRef}
      screenVideoRef={screenVideoRef}
      micOn={lobbyMicOn}
      interviewerPresence={interviewerPresence}
      formatTime={formatTime}
      recordingStartBusy={recordingStartBusy}
      onReconnect={restartFullInterviewCapture}
      onRerecord={() => requestVersionAction('rerecord')}
      onSubmit={() => requestVersionAction('submit')}
    />
  )
}
