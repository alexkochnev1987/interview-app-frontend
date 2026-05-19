'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import {
  TakeCompleteScreen,
  TakeConsentScreen,
  TakeLobbyScreen,
  TakeRecordingScreen,
} from '@/components/take'
import { FlashErrorToast } from '@/components/ui/flash-error-toast'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import {
  useTakeInterviewBeforeUnload,
  useTakeOrchestrator,
} from '@/features/take'
import { TOAST_MESSAGES } from '@/lib/toast-messages'

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
    capturePipelineReady,
    currentVersionNumber,
    requestVersionAction,
    permissionLabel,
    permissionTone,
    formatTime,
    interviewerPresence,
  } = useTakeOrchestrator({ id, candidateToken })

  useTakeInterviewBeforeUnload(stage)

  if (error && !interview) {
    return (
      <PageMainLayout>
        <PageContent>
          <FlashErrorToast
            toastId="take-interview-unavailable"
            message={TOAST_MESSAGES.pageGate.interview.unavailableTitle}
            description={error}
          />
          <EmptyStateCard
            icon={
              <Icon size="lg">
                <AlertCircle />
              </Icon>
            }
            title={TOAST_MESSAGES.pageGate.interview.unavailableTitle}
            description="This interview link may be invalid, expired, or no longer available. Details are shown in the notification."
          />
        </PageContent>
      </PageMainLayout>
    )
  }

  if (stage === 'loading' || !interview) {
    return (
      <PageMainLayout>
        <LoadingStateCard label="Loading interview..." />
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
      capturePipelineReady={capturePipelineReady}
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
      interviewerPresence={interviewerPresence}
      formatTime={formatTime}
      recordingStartBusy={recordingStartBusy}
      onReconnect={restartFullInterviewCapture}
      onRerecord={() => requestVersionAction('rerecord')}
      onSubmit={() => requestVersionAction('submit')}
    />
  )
}
