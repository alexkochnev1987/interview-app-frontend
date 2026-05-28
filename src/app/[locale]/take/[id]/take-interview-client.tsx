'use client'

import { useCallback } from 'react'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import {
  TakeCompleteScreen,
  TakeConsentScreen,
  TakeLobbyScreen,
  TakeRecordingScreen,
} from '@/components/take'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import {
  TAKE_MESSAGES,
  type TakeMessageKey,
  useTakeInterviewBeforeUnload,
  useTakeOrchestrator,
} from '@/features/take'
import type { TakeInterviewData } from '@/lib/api'

type TakeInterviewClientProps = {
  id: string
  candidateToken?: string
  initialInterview?: TakeInterviewData
}

export function TakeInterviewClient({
  id,
  candidateToken = '',
  initialInterview,
}: TakeInterviewClientProps) {
  const t = useTranslations('toast.pageGate.take')
  const tCommon = useTranslations('common')
  const tTake = useTranslations('takeFlow')

  const takeMessage = useCallback(
    (key: TakeMessageKey) => (tTake.has(key) ? tTake(key) : TAKE_MESSAGES[key]),
    [tTake],
  )

  const {
    stage,
    interview,
    error,
    candidateSessionReady,
    sessionSyncError,
    retrySessionSync,
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
  } = useTakeOrchestrator({ id, candidateToken, initialInterview, takeMessage })

  useTakeInterviewBeforeUnload(stage, takeMessage('beforeUnloadLeaveInterview'))

  if (error && !interview) {
    return (
      <PageMainLayout>
        <PageContent>
          <EmptyStateCard
            icon={
              <Icon size="lg">
                <AlertCircle />
              </Icon>
            }
            title={t('unavailableTitle')}
            description={error}
          />
        </PageContent>
      </PageMainLayout>
    )
  }

  if (stage === 'loading' || !interview) {
    return (
      <PageMainLayout>
        <LoadingStateCard label={tCommon('loading')} />
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
        sessionSyncError={sessionSyncError}
        continueDisabled={!candidateSessionReady}
        onConsentChange={setConsent}
        onContinueToLobby={proceedToLobby}
        onRetrySessionSync={retrySessionSync}
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
