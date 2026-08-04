'use client'

import { AlertCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useLayoutEffect, useState, type ReactNode } from 'react'

import { PageContent, PageMainLayout, PageMainViewport } from '@/components/layout/page-shell'
import {
  TakeCompleteScreen,
  TakeConsentScreen,
  TakeLobbyScreen,
  TakeRecordingScreen,
} from '@/components/take'
import { Icon } from '@/components/ui/icon'
import { Stack } from '@/components/ui/layout'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import {
  TAKE_MESSAGES,
  type TakeMessageKey,
  type TakeMessageValues,
  useTakeInterviewBeforeUnload,
  useTakeOrchestrator,
} from '@/features/take'
import { resolveQuestionAnswerPhase } from '@/features/take/session-machine'
import {
  TakeFlowLocaleProvider,
  resolveTakeInterviewLocale,
} from '@/features/take/take-flow-locale-provider'
import { TakeMediaProvider } from '@/features/take/take-media-context'
import type { Locale } from '@/i18n/locales'
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
  const [interviewLocale, setInterviewLocale] = useState<Locale | null>(() =>
    initialInterview?.interviewLocale
      ? resolveTakeInterviewLocale(initialInterview.interviewLocale)
      : null,
  )

  return (
    <TakeFlowLocaleProvider interviewLocale={interviewLocale}>
      <TakeInterviewClientInner
        id={id}
        candidateToken={candidateToken}
        initialInterview={initialInterview}
        lockedLocale={interviewLocale}
        onInterviewLocale={setInterviewLocale}
      />
    </TakeFlowLocaleProvider>
  )
}

type TakeInterviewClientInnerProps = TakeInterviewClientProps & {
  lockedLocale: Locale | null
  onInterviewLocale: (locale: Locale) => void
}

function TakeInterviewClientInner({
  id,
  candidateToken = '',
  initialInterview,
  lockedLocale,
  onInterviewLocale,
}: TakeInterviewClientInnerProps) {
  const t = useTranslations('toast.pageGate.take')
  const tCommon = useTranslations('common')
  const tTake = useTranslations('takeFlow')
  const uiLocale = useLocale() as Locale

  const takeMessage = useCallback(
    (key: TakeMessageKey, values?: TakeMessageValues) =>
      tTake.has(key)
        ? values
          ? tTake(key, values)
          : tTake(key)
        : TAKE_MESSAGES[key].replace(/\{(\w+)\}/g, (_, token) =>
            String(values?.[token] ?? `{${token}}`),
          ),
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
    actionErrorKind,
    timeLeft,
    versionPersistKind,
    uploading,
    isBrowserTranscriptSupported,
    finalTranscript,
    interimTranscript,
    browserTranscriptWarning,
    videoRef,
    cameraStream,
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
    displayedAttemptNumber,
    retakeDisabled,
    maxAttempts,
    attemptsExhausted,
    submitAllowed,
    exhaustedHint,
    showDeviceReconnect,
    requestSubmitAction,
  } = useTakeOrchestrator({
    id,
    candidateToken,
    initialInterview,
    takeMessage,
  })

  useLayoutEffect(() => {
    if (!interview?.interviewLocale) {
      return
    }
    const nextLocale = resolveTakeInterviewLocale(interview.interviewLocale)
    if (nextLocale === lockedLocale) {
      return
    }
    onInterviewLocale(nextLocale)
  }, [interview?.interviewLocale, lockedLocale, onInterviewLocale])

  useTakeInterviewBeforeUnload(stage, takeMessage('beforeUnloadLeaveInterview'))

  const wrapTakeStage = useCallback(
    (content: ReactNode) => (
      <TakeMediaProvider cameraStream={cameraStream}>
        <PageMainViewport spacing="take">
          <Stack gap={4} grow="fill" width="full">
            {content}
          </Stack>
        </PageMainViewport>
      </TakeMediaProvider>
    ),
    [cameraStream],
  )

  const targetInterviewLocale = interview?.interviewLocale
    ? resolveTakeInterviewLocale(interview.interviewLocale)
    : null
  const awaitingLocaleLock =
    targetInterviewLocale != null &&
    (lockedLocale !== targetInterviewLocale || uiLocale !== targetInterviewLocale)

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

  if (stage === 'loading' || !interview || awaitingLocaleLock) {
    return (
      <PageMainLayout>
        <LoadingStateCard label={tCommon('loading')} />
      </PageMainLayout>
    )
  }

  if (stage === 'complete') {
    return wrapTakeStage(
      <TakeCompleteScreen candidateName={interview.candidateName} position={interview.position} />,
    )
  }

  if (stage === 'consent') {
    return wrapTakeStage(
      <TakeConsentScreen
        interview={interview}
        consent={consent}
        setupError={setupError}
        sessionSyncError={sessionSyncError}
        continueDisabled={!candidateSessionReady}
        onConsentChange={setConsent}
        onContinueToLobby={proceedToLobby}
        onRetrySessionSync={retrySessionSync}
      />,
    )
  }

  if (stage === 'lobby') {
    return wrapTakeStage(
      <TakeLobbyScreen
        cameraStatus={cameraStatus}
        screenStatus={screenStatus}
        screenSurface={screenSurface}
        setupBusy={setupBusy}
        setupError={setupError}
        videoRef={videoRef}
        cameraStream={cameraStream}
        permissionLabel={permissionLabel}
        permissionTone={permissionTone}
        lobbyMicOn={lobbyMicOn}
        lobbyCameraOn={lobbyCameraOn}
        lobbyJoinReady={lobbyJoinReady}
        reviewContinueHint={resolveQuestionAnswerPhase(interview) === 'review'}
        onToggleMic={() => void toggleLobbyMic()}
        onToggleCamera={() => void toggleLobbyCamera()}
        onScreenShare={() => void attachLobbyScreenShare()}
        onJoin={startInterviewFromLobby}
      />,
    )
  }

  return wrapTakeStage(
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
      actionErrorKind={actionErrorKind}
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
      retakeDisabled={retakeDisabled}
      displayedAttemptNumber={displayedAttemptNumber}
      maxAttempts={maxAttempts}
      attemptsExhausted={attemptsExhausted}
      submitAllowed={submitAllowed}
      exhaustedHint={exhaustedHint}
      showDeviceReconnect={showDeviceReconnect}
      onReconnect={restartFullInterviewCapture}
      onRerecord={() => requestVersionAction('rerecord')}
      onSubmit={requestSubmitAction}
    />,
  )
}
