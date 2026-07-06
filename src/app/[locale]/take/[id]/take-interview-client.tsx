'use client'

import { useCallback, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { PageContent, PageMainLayout, PageMainViewport } from '@/components/layout/page-shell'
import {
  TakeCompleteScreen,
  TakeConsentScreen,
  TakeLobbyScreen,
  TakeRecordingScreen,
} from '@/components/take'
import { TakeLocaleBar } from '@/components/ui/take'
import { Stack } from '@/components/ui/layout'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import {
  TAKE_MESSAGES,
  type TakeMessageKey,
  type TakeMessageValues,
  useTakeInterviewBeforeUnload,
  useTakeLocaleSwitch,
  useTakeOrchestrator,
} from '@/features/take'
import {
  TakeFlowLocaleProvider,
  useTakeFlowLocale,
} from '@/features/take/take-flow-locale-provider'
import type { TakeInterviewData } from '@/lib/api'
import type { Locale } from '@/i18n/locales'

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
  return (
    <TakeFlowLocaleProvider>
      <TakeInterviewClientInner
        id={id}
        candidateToken={candidateToken}
        initialInterview={initialInterview}
      />
    </TakeFlowLocaleProvider>
  )
}

function TakeInterviewClientInner({
  id,
  candidateToken = '',
  initialInterview,
}: TakeInterviewClientProps) {
  const { locale: contentLocale } = useTakeFlowLocale()
  const t = useTranslations('toast.pageGate.take')
  const tCommon = useTranslations('common')
  const tTake = useTranslations('takeFlow')

  const takeMessage = useCallback(
    (key: TakeMessageKey, values?: TakeMessageValues) =>
      tTake.has(key)
        ? values
          ? tTake(key, values)
          : tTake(key)
        : TAKE_MESSAGES[key].replace(
            /\{(\w+)\}/g,
            (_, token) => String(values?.[token] ?? `{${token}}`),
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
    localeSwitchDisabled,
    startInterviewFromLobby,
    recordingStartBusy,
    capturePipelineReady,
    currentVersionNumber,
    requestVersionAction,
    permissionLabel,
    permissionTone,
    formatTime,
    interviewerPresence,
  } = useTakeOrchestrator({
    id,
    candidateToken,
    initialInterview,
    contentLocale,
    takeMessage,
  })

  const {
    locale,
    switchLocale,
    languageOptions,
    languageAriaLabel,
  } = useTakeLocaleSwitch()

  const handleSelectLocale = useCallback(
    (nextLocale: Locale) => {
      if (localeSwitchDisabled) {
        return;
      }
      switchLocale(nextLocale);
    },
    [localeSwitchDisabled, switchLocale],
  );

  useTakeInterviewBeforeUnload(stage, takeMessage('beforeUnloadLeaveInterview'))

  const wrapTakeStage = useCallback(
    (content: ReactNode) => (
      <PageMainViewport spacing="take">
        <Stack gap={4} grow="fill" width="full">
          <TakeLocaleBar
            ariaLabel={languageAriaLabel}
            currentLocale={locale}
            options={languageOptions}
            onSelectLocale={handleSelectLocale}
            interviewLocale={interview?.interviewLocale}
            resolvedLocale={interview?.currentQuestion?.resolvedLocale}
            disabled={localeSwitchDisabled}
          />
          {content}
        </Stack>
      </PageMainViewport>
    ),
    [
      languageAriaLabel,
      locale,
      languageOptions,
      handleSelectLocale,
      interview?.interviewLocale,
      interview?.currentQuestion?.resolvedLocale,
      localeSwitchDisabled,
    ],
  )

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
    return wrapTakeStage(
      <TakeCompleteScreen
        candidateName={interview.candidateName}
        position={interview.position}
      />,
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
        permissionLabel={permissionLabel}
        permissionTone={permissionTone}
        lobbyMicOn={lobbyMicOn}
        lobbyCameraOn={lobbyCameraOn}
        lobbyJoinReady={lobbyJoinReady}
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
    />,
  )
}
