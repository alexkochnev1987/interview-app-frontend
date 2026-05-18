'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

import { PageContent, PageMainLayout } from '@/components/layout/page-shell'
import { TakeCompleteScreen } from '@/components/take/take-complete-screen'
import { TakeConsentScreen } from '@/components/take/take-consent-screen'
import { TakeRecordingScreen } from '@/components/take/take-recording-screen'
import { FlashErrorToast } from '@/components/ui/flash-error-toast'
import { Icon } from '@/components/ui/icon'
import { EmptyStateCard, LoadingStateCard } from '@/components/ui/state-card'
import { useTakeOrchestrator } from '@/features/take'
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
    currentVersionNumber,
    retakeCount,
    timeLeft,
    transitionLabel,
    uploading,
    isBrowserTranscriptSupported,
    finalTranscript,
    interimTranscript,
    browserTranscriptWarning,
    videoRef,
    screenVideoRef,
    progressValue,
    setConsent,
    handleStartInterview,
    requestVersionAction,
    permissionLabel,
    permissionTone,
    formatTime,
  } = useTakeOrchestrator({ id, candidateToken })


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
        <PageContent>
          <LoadingStateCard label="Loading interview..." />
        </PageContent>
      </PageMainLayout>
    )
  }

  if (stage === 'complete') {
    return <TakeCompleteScreen candidateName={interview.candidateName} position={interview.position} />
  }

  if (stage === 'consent') {
    return (
      <TakeConsentScreen
        interview={interview}
        cameraStatus={cameraStatus}
        screenStatus={screenStatus}
        screenSurface={screenSurface}
        consent={consent}
        setupBusy={setupBusy}
        setupError={setupError}
        onConsentChange={setConsent}
        onStartInterview={handleStartInterview}
        permissionLabel={permissionLabel}
        permissionTone={permissionTone}
      />
    )
  }

  return (
    <TakeRecordingScreen
      interview={interview}
      stage={stage}
      progressValue={progressValue}
      screenSurface={screenSurface}
      setupError={setupError}
      submitError={submitError}
      currentVersionNumber={currentVersionNumber}
      retakeCount={retakeCount}
      timeLeft={timeLeft}
      transitionLabel={transitionLabel}
      uploading={uploading}
      isBrowserTranscriptSupported={isBrowserTranscriptSupported}
      finalTranscript={finalTranscript}
      interimTranscript={interimTranscript}
      browserTranscriptWarning={browserTranscriptWarning}
      videoRef={videoRef}
      screenVideoRef={screenVideoRef}
      formatTime={formatTime}
      onReconnect={handleStartInterview}
      onRerecord={() => requestVersionAction('rerecord')}
      onSubmit={() => requestVersionAction('submit')}
    />
  )
}
