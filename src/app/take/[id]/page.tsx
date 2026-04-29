'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { LoadingStateCard } from '@/components/app/state-card'
import { MaxWidth4xl, PageMainCompact } from '@/components/layout/page-shell'
import { TakeCompleteScreen } from '@/components/take/take-complete-screen'
import { TakeConsentScreen } from '@/components/take/take-consent-screen'
import { TakeRecordingScreen } from '@/components/take/take-recording-screen'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTakeOrchestrator } from '@/features/take'

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
      <PageMainCompact>
        <MaxWidth4xl>
          <Alert variant="destructive">
            <AlertTitle>Interview unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </MaxWidth4xl>
      </PageMainCompact>
    )
  }

  if (stage === 'loading' || !interview) {
    return (
      <PageMainCompact>
        <MaxWidth4xl>
          <LoadingStateCard label="Loading interview..." />
        </MaxWidth4xl>
      </PageMainCompact>
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
      formatTime={formatTime}
      onRerecord={() => requestVersionAction('rerecord')}
      onSubmit={() => requestVersionAction('submit')}
    />
  )
}
